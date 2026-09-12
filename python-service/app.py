from flask import Flask, request, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

@app.route('/api/intelligence/analyze', methods=['POST'])
def analyze():
    try:
        transactions = request.get_json()
        if not transactions:
            return jsonify({"healthScore": 100, "anomalies": [], "forecast": 0, "trends": {}, "percentageSpentIncrease": 0})

        df = pd.DataFrame(transactions)
        
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
        df['type'] = df['type'].fillna('expense')
        
        df_expenses = df[df['type'] == 'expense']
        
        if df_expenses.empty:
            return jsonify({"healthScore": 100, "anomalies": [], "forecast": 0, "trends": {}, "percentageSpentIncrease": 0})

        total_spent = float(df_expenses['amount'].sum())
        
        amounts_vector = df_expenses['amount'].to_numpy()
        mean_spend = np.mean(amounts_vector)
        std_spend = np.std(amounts_vector) if len(amounts_vector) > 1 else 0
        
        anomaly_threshold = mean_spend + (2 * std_spend) if std_spend > 0 else mean_spend * 3
        df_anomalies = df_expenses[df_expenses['amount'] > anomaly_threshold]
        
        anomalies_list = df_anomalies[['description', 'amount', 'category']].to_dict(orient='records')

        cat_group = df_expenses.groupby('category')['amount'].sum()
        trends_dict = {str(k): float(v) for k, v in cat_group.items()}
        projected_forecast = float(np.round(total_spent * 1.07))

        # Calculate real MoM percentage increase for Food
        food_expenses = df_expenses[df_expenses['category'].str.lower() == 'food']
        
        if not food_expenses.empty and 'date' in df_expenses.columns:
            food_expenses['date'] = pd.to_datetime(food_expenses['date'], errors='coerce')
            now = pd.Timestamp.now()
            current_month_mask = (food_expenses['date'].dt.month == now.month) & (food_expenses['date'].dt.year == now.year)
            
            # Handle january (month 1 -> 12, year -> year - 1)
            last_month_val = 12 if now.month == 1 else now.month - 1
            last_month_year = now.year - 1 if now.month == 1 else now.year
            last_month_mask = (food_expenses['date'].dt.month == last_month_val) & (food_expenses['date'].dt.year == last_month_year)

            current_food = float(food_expenses[current_month_mask]['amount'].sum())
            last_food = float(food_expenses[last_month_mask]['amount'].sum())
            
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
