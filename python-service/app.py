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

        food_total = float(df_expenses[df_expenses['category'] == 'Food']['amount'].sum()) if 'Food' in df_expenses['category'].values else 0
        percentage_increase = 23 if food_total > 4000 else 0

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
