import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",          # usuário do MySQL
        password="*1407*", # senha do MySQL
        database="conveniencia"
    )
