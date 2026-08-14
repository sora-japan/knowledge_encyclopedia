import requests
# requestsのコードAPIからデータ取得
res = requests.get("http://127.0.0.1:8000/health")

print(res.status_code)
print(res.text)

