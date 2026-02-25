from db import get_connection

def generate_sales_report(start_date, end_date):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                s.id,
                s.created_id AS timestamp,
                s.payment_method AS payment_method,
                s.total,
                p.name AS product_name,
                si.quantity,
                si.price AS unit_price
            FROM sales s
            JOIN sales_items si ON s.id = si.sale_id
            JOIN products p ON p.id = si.product_id
            WHERE s.created_id BETWEEN %s AND %s
            ORDER BY s.created_id DESC
        """, (start_date, end_date))

        rows = cursor.fetchall()
        sales = {}

        payment_map = {
            "DEBITO": "DÉBITO",
            "CREDITO": "CRÉDITO",
            "PIX": "PIX",
            "DINHEIRO": "DINHEIRO"
        }

        for row in rows:
            sale_id = row["id"]

            if sale_id not in sales:
                sales[sale_id] = {
                    "id": sale_id,
                    "timestamp": row["timestamp"].timestamp() * 1000,  # JS friendly
                    "paymentMethod": payment_map.get(
                        row["payment_method"],
                        row["payment_method"]
                    ),
                    "items": [],
                    "total": float(row["total"])
                }

            sales[sale_id]["items"].append({
                "name": row["product_name"],
                "quantity": row["quantity"],
                "price": float(row["unit_price"])
            })

        return {
            "success": True,
            "data": list(sales.values())
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

    finally:
        cursor.close()
        conn.close()
