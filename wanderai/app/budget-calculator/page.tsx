import BudgetCalculator from "@/components/budget/BudgetCalculator";

export default function BudgetCalculatorPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="max-w-xl mb-14">
          <h1 className="font-display text-4xl md:text-5xl mb-4">Plan your budget</h1>
          <p className="text-muted leading-relaxed">
            A realistic estimate for transportation, stay, food and activities — built from
            typical costs across our destinations.
          </p>
        </div>

        <BudgetCalculator />
      </div>
    </div>
  );
}
