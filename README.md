# Инструкция по развёртыванию

## Наличие:
1. python >= 3.12 
2. poetry >= 1.8.3
3. node.js >= 22.9

## Back

### Development

#### Установка зависимостей:
```
poetry install
```

#### Запуск
```
poetry run uvicorn app.main:app --host <host> --port <port>
``` 

### Production

#### Установка зависимостей:
```
poetry install --no-dev
```

#### Запуск
```
gunicorn -w <n workers> -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:<port> 
```

## Front

### Development

#### Установка зависимостей:
```
npm install
```

#### Запуск
```
npm run start
``` 

### Production

#### Установка зависимостей:
```
npm install --production
```

#### Запуск
```
npm run build
```

### Конфиг nginx
```
server {                                                                                                                                                                                                                         
    listen 80;                                                                                                                                                                                                               
    server_name <ip>;                                                                                                                                                                                                 
    root <path to build>;                                                                                                                                                                                      
    location / {                                                                                                                                                                                                             
        try_files $uri /index.html;                                                                                                                                                                                      
    }                                                                                                                                                                                                                        
} 
```
