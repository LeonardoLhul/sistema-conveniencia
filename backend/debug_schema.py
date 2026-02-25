import mysql.connector
from db import get_connection

def inspect_tables():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        tables = ['sales', 'sales_items', 'products']
        
        for table in tables:
            print(f"\n--- Structure of table '{table}' ---")
            try:
                cursor.execute(f"DESCRIBE {table}")
                columns = cursor.fetchall()
                for col in columns:
                    print(f"{col['Field']} - {col['Type']}")
                
                # Show first 5 rows
                print(f"--- Top 5 rows from '{table}' ---")
                cursor.execute(f"SELECT * FROM {table} LIMIT 5")
                rows = cursor.fetchall()
                if not rows:
                    print("(Table is empty)")
                for row in rows:
                    print(row)
                    
            except mysql.connector.Error as err:
                 print(f"Error inspecting {table}: {err}")

    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

if __name__ == "__main__":
    inspect_tables()
