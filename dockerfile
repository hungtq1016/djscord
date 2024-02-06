# Sử dụng image Node.js 20 làm base image
FROM node:20

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file 'package.json' và 'package-lock.json' (nếu có) vào thư mục làm việc
COPY package*.json ./

# Cài đặt Nodemon và các phụ thuộc khác
RUN npm install -g nodemon
RUN npm install

# Sao chép mã nguồn của ứng dụng vào thư mục làm việc trong container
COPY . .

# Mở cổng 3000 để có thể truy cập ứng dụng từ bên ngoài container
EXPOSE 3000

# Chạy ứng dụng sử dụng Nodemon
CMD ["nodemon", "index.js"]
