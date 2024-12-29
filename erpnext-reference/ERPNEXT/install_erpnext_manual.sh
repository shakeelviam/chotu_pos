#!/bin/bash

# Create Python virtual environment
setup_python_env() {
    echo "Setting up Python virtual environment..."
    python3 -m venv env
    source env/bin/activate
    pip3 install --upgrade pip
    pip3 install frappe-bench
}

# Install and configure MariaDB
setup_database() {
    echo "Setting up MariaDB..."
    sudo apt update
    sudo apt install -y mariadb-server mariadb-client libmariadb-dev
    
    # Secure MariaDB installation
    sudo mysql_secure_installation
    
    # Create database user
    sudo mysql -u root -p <<EOF
CREATE USER 'erpnext'@'localhost' IDENTIFIED BY 'erpnext';
GRANT ALL PRIVILEGES ON *.* TO 'erpnext'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOF
}

# Install Node.js and yarn
setup_nodejs() {
    echo "Setting up Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    sudo npm install -g yarn
}

# Install and configure Redis
setup_redis() {
    echo "Setting up Redis..."
    sudo apt install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
}

# Setup ERPNext
setup_erpnext() {
    echo "Setting up ERPNext..."
    bench init --frappe-branch version-15 frappe-bench
    cd frappe-bench
    
    # Create new site
    bench new-site mysite.local
    
    # Get ERPNext
    bench get-app --branch version-15 erpnext
    
    # Install ERPNext on site
    bench --site mysite.local install-app erpnext
    
    # Build assets
    bench build
    
    # Start development server
    bench start
}

# Main installation process
main() {
    echo "Starting manual ERPNext installation..."
    setup_python_env
    setup_database
    setup_nodejs
    setup_redis
    setup_erpnext
    
    echo "Installation complete! Access ERPNext at http://localhost:8000"
    echo "Remember to:"
    echo "1. Activate virtual environment: source env/bin/activate"
    echo "2. Start server: bench start"
}

# Run the installation
main
