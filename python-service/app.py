from flask import Flask, request, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)


def forecast_monthly_spending(expenses, current_month, first_month):
    """Average spending over up to three completed months of ledger history."""
    if pd.isna(first_month) or first_month >= current_month:
        return None
    months = pd.period_range(max(first_month, current_month - 3), current_month - 1, freq='M')
    totals = expenses.groupby('month')['amount'].sum().reindex(months, fill_value=0)
    return round(float(totals.mean()), 2)


@app.route('/api/intelligence/analyze', methods=['POST'])
def analyze():
    try:
        transactions = request.get_json()
        if not transactions:
            return jsonify({"healthScore": 100, "anomalies": [], "forecast": None, "trends": {}, "percentageSpentIncrease": 0})

        df = pd.DataFrame(transactions)
        
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
        df['type'] = df['type'].fillna('expense')
        
        now = pd.Timestamp.now(tz='UTC')
        current_month = now.tz_localize(None).to_period('M')
        dates = pd.to_datetime(df.get('date', pd.Series(pd.NaT, index=df.index)), errors='coerce', utc=True)
        df['month'] = dates.dt.tz_localize(None).dt.to_period('M')
        df_expenses = df[(df['type'] == 'expense') & (dates.isna() | (dates <= now))]
        projected_forecast = forecast_monthly_spending(df_expenses, current_month, df['month'].min())
        
        if df_expenses.empty:
            return jsonify({"healthScore": 100, "anomalies": [], "forecast": projected_forecast, "trends": {}, "percentageSpentIncrease": 0})

        total_spent = float(df_expenses['amount'].sum())
        
        amounts_vector = df_expenses['amount'].to_numpy()
        mean_spend = np.mean(amounts_vector)
        std_spend = np.std(amounts_vector) if len(amounts_vector) > 1 else 0
        
        anomaly_threshold = mean_spend + (2 * std_spend) if std_spend > 0 else mean_spend * 3
        df_anomalies = df_expenses[df_expenses['amount'] > anomaly_threshold]
        
        anomalies_list = df_anomalies[['description', 'amount', 'category']].to_dict(orient='records')

        cat_group = df_expenses.groupby('category')['amount'].sum()
        trends_dict = {str(k): float(v) for k, v in cat_group.items()}

        # Calculate real MoM percentage increase for Food
        food_expenses = df_expenses[df_expenses['category'].str.lower() == 'food']
        
        if not food_expenses.empty:
            current_food = float(food_expenses.loc[food_expenses['month'] == current_month, 'amount'].sum())
            last_food = float(food_expenses.loc[food_expenses['month'] == current_month - 1, 'amount'].sum())
            
            if last_food > 0:
                percentage_increase = int(((current_food - last_food) / last_food) * 100)
                percentage_increase = max(0, percentage_increase) # Only report increases
            else:
                percentage_increase = 0
        else:
            percentage_increase = 0

        health_score = max(50, 100 - (len(anomalies_list) * 12) - int(total_spent / 3000))

        output = {
            "healthScore": int(health_score),
            "anomalies": anomalies_list,
            "forecast": projected_forecast,
            "trends": trends_dict,
            "percentageSpentIncrease": percentage_increase
        }
        return jsonify(output)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
