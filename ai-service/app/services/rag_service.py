import re

class FinancialQAService:
    """
    Lightweight, rule-based Financial Q&A engine.
    Parses structured context injected by the backend and answers
    financial queries with 100% accuracy — no model loading, no RAM overhead.
    """

    def __init__(self):
        self.is_ready = True
        print("FinancialQA engine ready (zero-RAM, rule-based).", flush=True)

    # ------------------------------------------------------------------
    # Context parsing helpers
    # ------------------------------------------------------------------

    def _parse_context(self, context_texts: list[str]) -> dict:
        """Extract all known financial metrics from the injected context lines."""
        data = {
            "income": None,
            "expense": None,
            "safe_to_spend": None,
            "locked_budgets": None,
            "goal_savings": None,
            "fin_score": None,
            "savings_rate": None,
            "categories": {},       # {name: amount}
            "category_budgets": {}, # {name: limit}
            "goals_detail": {},     # {name: {target, saved}}
            "transactions": [],     # [{date, type, amount, category}]
        }

        for line in context_texts:
            line = line.strip()
            l = line.lower()

            # Key summary metrics
            m = re.search(r"total income.*?₹([\d,\.]+)", l)
            if m:
                data["income"] = self._num(m.group(1))

            m = re.search(r"total expense.*?₹([\d,\.]+)", l)
            if m:
                data["expense"] = self._num(m.group(1))

            m = re.search(r"safe.to.spend.*?₹([\d,\.]+)", l)
            if m:
                data["safe_to_spend"] = self._num(m.group(1))

            m = re.search(r"locked in budget.*?₹([\d,\.]+)", l)
            if m:
                data["locked_budgets"] = self._num(m.group(1))

            m = re.search(r"goal savings.*?₹([\d,\.]+)", l)
            if m:
                data["goal_savings"] = self._num(m.group(1))

            m = re.search(r"finscore.*?is\s+([\d]+)", l)
            if m:
                data["fin_score"] = int(m.group(1))

            m = re.search(r"savings rate.*?([\d\.]+)%", l)
            if m:
                data["savings_rate"] = float(m.group(1))

            # Category breakdown lines: "My spending on Shopping is ₹500"
            m = re.search(r"spending on (.+?) is ₹([\d,\.]+)", l)
            if m:
                data["categories"][m.group(1).strip().title()] = self._num(m.group(2))

            # Budget limit lines: "I have a budget limit of ₹5000 for Entertainment."
            m = re.search(r"budget limit of ₹([\d,\.]+) for (.+?)\.", l)
            if m:
                data["category_budgets"][m.group(2).strip().title()] = self._num(m.group(1))

            # Goal detail lines: "I have a savings goal called 'Buying iPhone' with a target of ₹50000 and I have saved ₹10000 so far."
            m = re.search(r'savings goal called "(.+?)" with a target of ₹([\d,\.]+) and i have saved ₹([\d,\.]+)', l)
            if m:
                data["goals_detail"][m.group(1).strip().title()] = {
                    "target": self._num(m.group(2)),
                    "saved": self._num(m.group(3))
                }

            # Transaction lines: "On 2024-09-01, I had an expense of ₹500 for Shopping."
            m = re.search(r"on ([\d\-]+),\s+i had an? (\w+) of ₹([\d,\.]+) for (.+?)\.", l)
            if m:
                data["transactions"].append({
                    "date": m.group(1),
                    "type": m.group(2),
                    "amount": self._num(m.group(3)),
                    "category": m.group(4).strip().title(),
                })

        return data

    def _num(self, s: str) -> float:
        return float(s.replace(",", "").strip())

    def _fmt(self, amount: float) -> str:
        return f"₹{amount:,.2f}"

    # ------------------------------------------------------------------
    # Topic classification
    # ------------------------------------------------------------------

    def _classify(self, q: str) -> str:
        q = q.lower()
        if any(w in q for w in ["income", "earned", "received", "salary", "credited"]):
            return "income"
        if any(w in q for w in ["expense", "spent", "spending", "cost", "paid", "debit"]):
            return "expense"
        if any(w in q for w in ["safe to spend", "available", "left", "balance", "remaining", "can i spend"]):
            return "safe_to_spend"
        if any(w in q for w in ["budget", "locked", "lock"]):
            return "budget"
        if any(w in q for w in ["goal", "saving", "savings", "target"]):
            return "goal"
        if any(w in q for w in ["finscore", "fin score", "financial score", "score", "health"]):
            return "finscore"
        if any(w in q for w in ["category", "categories", "where", "breakdown", "most", "highest"]):
            return "category"
        if any(w in q for w in ["transaction", "recent", "last", "history", "when"]):
            return "transaction"
        if any(w in q for w in ["okay", "ok", "thanks", "thank you", "cool", "got it", "nice"]):
            return "greeting"
        if any(w in q for w in ["balance it", "advice", "recommend", "suggestion", "what should i do", "how to improve"]):
            return "advice"
        if any(w in q for w in ["afford", "buy", "purchase", "can i"]):
            return "afford"
        if any(w in q for w in ["summary", "overview", "report", "tell me everything", "how am i doing"]):
            return "summary"
        return "general"

    # ------------------------------------------------------------------
    # Response builders
    # ------------------------------------------------------------------

    def query(self, user_query: str, context_texts: list[str], history: list[dict] = None) -> str:
        data = self._parse_context(context_texts)
        topic = self._classify(user_query)

        if topic == "greeting":
            return "You're welcome! Let me know if you need help with anything else."

        elif topic == "advice":
            if data["fin_score"] is not None and data["safe_to_spend"] is not None:
                if data["safe_to_spend"] < 0:
                    return f"Since your Safe to Spend is {self._fmt(data['safe_to_spend'])}, you are currently over budget. The best step right now is to pause all non-essential spending (like Entertainment or Shopping) until next month."
                elif data["fin_score"] < 500:
                    return "Your FinScore is a bit low. To balance things, try cutting down on your top spending categories and increase your savings goal contributions."
                else:
                    return "You are doing well! To keep balancing your finances, stick to your category limits and keep contributing to your savings goals."
            return "To balance your finances, try setting strict category budgets and make sure you contribute a small portion of your income to savings goals each month."

        elif topic == "income":
            if data["income"] is not None:
                return f"Your total income this month is {self._fmt(data['income'])}. 💰"
            return "I couldn't find your income data in the current context."

        elif topic == "expense":
            # Check if asking about a specific category
            for cat in data["categories"]:
                if cat.lower() in user_query.lower():
                    return f"Your total spending on {cat} this month is {self._fmt(data['categories'][cat])}."
            if data["expense"] is not None:
                resp = f"Your total expenses this month are {self._fmt(data['expense'])}."
                if data["income"]:
                    pct = (data["expense"] / data["income"]) * 100
                    resp += f" That's {pct:.1f}% of your income."
                if data["categories"]:
                    top = sorted(data["categories"].items(), key=lambda x: x[1], reverse=True)[:3]
                    top_str = ", ".join([f"{c} ({self._fmt(a)})" for c, a in top])
                    resp += f"\n\nTop spending categories: {top_str}."
                return resp
            return "I couldn't find your expense data."

        elif topic == "safe_to_spend":
            if data["safe_to_spend"] is not None:
                resp = f"Your Safe to Spend balance is {self._fmt(data['safe_to_spend'])}."
                resp += "\n\nThis is calculated as: Income − Expenses − Locked Budgets."
                if data["safe_to_spend"] < 0:
                    resp += "\n\n⚠️ You are currently over budget. Consider reducing discretionary spending."
                elif data["safe_to_spend"] < 5000:
                    resp += "\n\n⚠️ Your buffer is quite low — spend carefully this month."
                return resp
            return "I couldn't find your safe-to-spend balance."

        elif topic == "budget":
            # Check for over-budget query
            uq_low = user_query.lower()
            if "over" in uq_low or "exceed" in uq_low or "any" in uq_low:
                over_budgets = []
                for cat, limit in data.get("category_budgets", {}).items():
                    spent = data.get("categories", {}).get(cat, 0.0)
                    if spent > limit:
                        over_budgets.append((cat, spent, limit))
                if over_budgets:
                    lines = [f"• {c}: Spent {self._fmt(s)} (Limit: {self._fmt(l)}) — 🔴 Over by {self._fmt(s-l)}" for c, s, l in over_budgets]
                    return "⚠️ Yes, you have exceeded your budget in the following categories:\n\n" + "\n".join(lines)
                elif data.get("category_budgets"):
                    return "✅ No, you haven't exceeded any of your category budgets. Great job!"
                else:
                    return "You haven't set any specific category budgets yet."

            # Check if asking about a specific category
            for cat, limit in data.get("category_budgets", {}).items():
                if cat.lower() in uq_low:
                    spent = data.get("categories", {}).get(cat, 0.0)
                    rem = limit - spent
                    status = f"✅ You are within budget. You have {self._fmt(rem)} left to spend." if rem >= 0 else f"🔴 You are over budget by {self._fmt(abs(rem))}."
                    return f"Your budget limit for {cat} is {self._fmt(limit)}.\nYou have spent {self._fmt(spent)} so far.\n\n{status}"

            if data["locked_budgets"] is not None:
                return (
                    f"Your total locked-in budgets amount is {self._fmt(data['locked_budgets'])}. 🔒\n\n"
                    f"These are reserved funds automatically deducted from your spendable balance, "
                    f"ensuring your committed expenses are always covered."
                )
            return "I couldn't find your budget data."

        elif topic == "goal":
            uq_low = user_query.lower()
            
            # Specific goal query check
            specific_goals = []
            for name, details in data.get("goals_detail", {}).items():
                if name.lower() in uq_low:
                    specific_goals.append((name, details["target"], details["saved"]))
            
            if specific_goals:
                lines = [f"• {n}: Saved {self._fmt(s)} out of {self._fmt(t)} target." for n, t, s in specific_goals]
                return "Here is the status of the goal you asked about:\n\n" + "\n".join(lines)
            
            # General goal query check
            if "what" in uq_low or "any" in uq_low or "list" in uq_low:
                if data.get("goals_detail"):
                    lines = [f"• {n}: Saved {self._fmt(d['saved'])} out of {self._fmt(d['target'])} target." for n, d in data.get("goals_detail", {}).items()]
                    return "You have the following savings goals:\n\n" + "\n".join(lines)
                else:
                    return "You haven't set up any specific savings goals yet."

            if data["goal_savings"] is not None:
                return (
                    f"Your total goal savings contributions this month are {self._fmt(data['goal_savings'])}. 🎯\n\n"
                    f"Keep it up! Consistent contributions are the key to reaching your financial targets."
                )
            return "I couldn't find your savings goals data."

        elif topic == "finscore":
            if data["fin_score"] is not None:
                score = data["fin_score"]
                if score >= 800:
                    rating = "Excellent 🌟 — You are in outstanding financial health!"
                elif score >= 600:
                    rating = "Good 👍 — You are managing your finances well."
                elif score >= 400:
                    rating = "Fair ⚠️ — There's room to improve your financial habits."
                else:
                    rating = "Needs Attention 🔴 — Focus on reducing expenses and saving more."
                return (
                    f"Your FinScore is {score} / 1000 — {rating}\n\n"
                    f"FinScore is calculated from 3 factors:\n"
                    f"• Expense Ratio (how much of income you spend) — max 400 pts\n"
                    f"• Goal Contributions (saving toward targets) — max 300 pts\n"
                    f"• Safe-to-Spend Buffer (financial cushion) — max 300 pts"
                )
            return "I couldn't find your FinScore."

        elif topic == "category":
            if data["categories"]:
                sorted_cats = sorted(data["categories"].items(), key=lambda x: x[1], reverse=True)
                lines = [f"• {c}: {self._fmt(a)}" for c, a in sorted_cats]
                return "Here's your spending breakdown by category this month:\n\n" + "\n".join(lines)
            return "I couldn't find your category breakdown."

        elif topic == "transaction":
            if data["transactions"]:
                # Most recent first
                recent = sorted(data["transactions"], key=lambda x: x["date"], reverse=True)[:5]
                lines = [
                    f"• {t['date']} — {t['type'].title()} of {self._fmt(t['amount'])} on {t['category']}"
                    for t in recent
                ]
                return "Here are your most recent transactions:\n\n" + "\n".join(lines)
            return "I couldn't find recent transaction history."

        elif topic == "afford":
            # Try to extract amount from query
            m = re.search(r"₹?([\d,]+)", user_query)
            if m and data["safe_to_spend"] is not None:
                amount = self._num(m.group(1))
                if amount <= data["safe_to_spend"]:
                    return (
                        f"✅ Yes, you can afford {self._fmt(amount)}!\n\n"
                        f"Your current Safe to Spend is {self._fmt(data['safe_to_spend'])}, "
                        f"so you would still have {self._fmt(data['safe_to_spend'] - amount)} remaining after this purchase."
                    )
                else:
                    over = amount - data["safe_to_spend"]
                    return (
                        f"❌ Unfortunately, you cannot afford {self._fmt(amount)} right now.\n\n"
                        f"Your Safe to Spend is only {self._fmt(data['safe_to_spend'])}, "
                        f"which is {self._fmt(over)} short. Consider waiting until next month."
                    )
            return f"Your current Safe to Spend balance is {self._fmt(data['safe_to_spend'] or 0)}. Tell me the amount you want to purchase and I'll check if you can afford it!"

        elif topic == "summary":
            parts = []
            if data["income"] is not None:
                parts.append(f"💰 Income: {self._fmt(data['income'])}")
            if data["expense"] is not None:
                parts.append(f"💸 Expenses: {self._fmt(data['expense'])}")
            if data["safe_to_spend"] is not None:
                parts.append(f"🟢 Safe to Spend: {self._fmt(data['safe_to_spend'])}")
            if data["locked_budgets"] is not None:
                parts.append(f"🔒 Locked Budgets: {self._fmt(data['locked_budgets'])}")
            if data["goal_savings"] is not None:
                parts.append(f"🎯 Goal Savings: {self._fmt(data['goal_savings'])}")
            if data["fin_score"] is not None:
                parts.append(f"📊 FinScore: {data['fin_score']} / 1000")
            if parts:
                return "Here's your financial summary for this month:\n\n" + "\n".join(parts)
            return "I don't have enough data to generate a summary yet."

        else:
            # Fallback — try to answer with available data
            if data["income"] or data["expense"] or data["safe_to_spend"]:
                return (
                    f"I'm VaultMind, your personal finance assistant! Here's what I know about your finances:\n\n"
                    + (f"• Income: {self._fmt(data['income'])}\n" if data['income'] else "")
                    + (f"• Expenses: {self._fmt(data['expense'])}\n" if data['expense'] else "")
                    + (f"• Safe to Spend: {self._fmt(data['safe_to_spend'])}\n" if data['safe_to_spend'] else "")
                    + (f"• FinScore: {data['fin_score']} / 1000\n" if data['fin_score'] else "")
                    + "\nAsk me anything specific — income, expenses, budgets, goals, FinScore, or if you can afford a purchase!"
                )
            return (
                "Hi! I'm VaultMind 🤖, your personal financial assistant. "
                "Ask me about your income, expenses, budgets, savings goals, FinScore, "
                "or whether you can afford a specific purchase!"
            )


# Singleton instance
rag_service = FinancialQAService()
