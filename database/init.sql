-- ============================================================
-- FinSight AI — PostgreSQL Schema (Single Source of Truth)
-- This file is the ONLY place the database schema is defined.
-- TypeORM `synchronize` is set to FALSE in the backend, so every
-- table/column here must match the TypeORM entities exactly.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- Trigger helper: auto-update `updated_at` on row changes
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- USERS  (matches: backend/src/users/entities/user.entity.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255),
    currency      VARCHAR(10) DEFAULT 'USD',
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS set_updated_at ON users;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ============================================================
-- CATEGORIES  (matches: backend/src/categories/entities/category.entity.ts)
-- user_id = NULL means it's a global default category (seeded below)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(20) NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
    icon       VARCHAR(50) DEFAULT 'tag',
    color      VARCHAR(20) DEFAULT '#6366f1',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);


-- ============================================================
-- TRANSACTIONS  (matches: backend/src/transactions/entities/transaction.entity.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount           NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    type             VARCHAR(20) NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
    description      VARCHAR(500),
    merchant         VARCHAR(255),
    transaction_date DATE NOT NULL,
    is_recurring     BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS set_updated_at ON transactions;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);


-- ============================================================
-- BUDGETS  (matches: backend/src/budgets/entities/budget.entity.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC(14, 2) NOT NULL CHECK (monthly_limit >= 0),
    month         INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year          INT NOT NULL CHECK (year >= 2000),
    created_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, category_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month_year ON budgets(user_id, month, year);


-- ============================================================
-- GOALS  (matches: backend/src/goals/entities/goal.entity.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    target_amount   NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
    current_amount  NUMERIC(14, 2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date     DATE,
    status          VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);


-- ============================================================
-- RECURRING SUBSCRIPTIONS
-- (matches: backend/src/predictions/entities/recurring-subscription.entity.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS recurring_subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_name   VARCHAR(255) NOT NULL,
    avg_amount      NUMERIC(14, 2) NOT NULL,
    frequency_days  INT NOT NULL,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    last_seen_date  DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, merchant_name)
);

CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_subscriptions(is_active);


-- ============================================================
-- ANOMALIES  (matches: backend/src/predictions/entities/anomaly.entity.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS anomalies (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    reason         VARCHAR(500),
    severity       VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    detected_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE (transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_anomalies_user_id ON anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity);


-- ============================================================
-- PREDICTION LOGS  (matches: backend/src/predictions/entities/prediction-log.entity.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS prediction_logs (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    predicted_amount  NUMERIC(14, 2) NOT NULL,
    category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    model_used        VARCHAR(50),
    prediction_date   DATE DEFAULT CURRENT_DATE,
    created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prediction_logs_user_id ON prediction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_date ON prediction_logs(prediction_date);


-- ============================================================
-- SIMULATOR SCENARIOS (matches: backend/src/simulator/entities/simulator-scenario.entity.ts)
-- ============================================================
CREATE TABLE IF NOT EXISTS simulator_scenarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    amount          NUMERIC(14, 2) NOT NULL,
    event_date      DATE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulator_scenarios_user_id ON simulator_scenarios(user_id);


-- ============================================================
-- SEED DATA — Global default categories (user_id = NULL)
-- Available to every user automatically via CategoriesService
-- (WHERE c.user_id = :userId OR c.is_default = true)
-- ============================================================
INSERT INTO categories (name, type, icon, color, is_default) VALUES
('Food & Dining',   'EXPENSE', 'utensils',      '#f97316', TRUE),
('Rent & Housing',  'EXPENSE', 'home',          '#8b5cf6', TRUE),
('Transport',       'EXPENSE', 'car',           '#3b82f6', TRUE),
('Entertainment',   'EXPENSE', 'film',          '#ec4899', TRUE),
('Utilities',       'EXPENSE', 'zap',           '#eab308', TRUE),
('Shopping',        'EXPENSE', 'shopping-bag',  '#14b8a6', TRUE),
('Healthcare',      'EXPENSE', 'heart',         '#ef4444', TRUE),
('Education',       'EXPENSE', 'book',          '#6366f1', TRUE),
('Subscriptions',   'EXPENSE', 'repeat',        '#a855f7', TRUE),
('Other Expense',   'EXPENSE', 'tag',           '#6b7280', TRUE),
('Salary',          'INCOME',  'briefcase',     '#22c55e', TRUE),
('Freelance',       'INCOME',  'laptop',        '#22c55e', TRUE),
('Other Income',    'INCOME',  'plus-circle',   '#22c55e', TRUE)
ON CONFLICT DO NOTHING;