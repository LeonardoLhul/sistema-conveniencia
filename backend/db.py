import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="",
        user="senhadocliente",          # usuário do MySQL
        password="senhadocliente", # senha do MySQL
        database="conveniencia"
    )
