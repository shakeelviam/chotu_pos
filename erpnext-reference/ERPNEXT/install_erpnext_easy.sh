#!/bin/bash

# Install system dependencies
install_dependencies() {
    echo "Installing system dependencies..."
    sudo apt update
    sudo apt install -y python3-dev python3-setuptools python3-pip python3-distutils python3-venv \
        redis-server mariadb-server mariadb-client libmariadb-dev libffi-dev libssl-dev \
        wkhtmltopdf libmysqlclient-dev git curl wget nodejs npm
}

# Configure MariaDB
setup_mariadb() {
    echo "Configuring MariaDB..."
    sudo mysql_secure_installation <<EOF

y
admin123
admin123
y
y
y
y
EOF

    # Create MySQL config
    sudo bash -c 'cat <<EOF > /etc/mysql/my.cnf
[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[mysql]
default-character-set = utf8mb4
EOF'

    # Restart MariaDB
    sudo service mysql restart
}

# Install Frappe Bench
install_bench() {
    echo "Installing Frappe Bench..."
    sudo pip3 install frappe-bench
    
    # Initialize new bench
    bench init --frappe-branch version-15 frappe-bench
    cd frappe-bench
    
    # Create new site
    bench new-site mysite.local --admin-password admin123 --mariadb-root-password admin123
    
    # Get and install ERPNext
    bench get-app --branch version-15 erpnext
    bench --site mysite.local install-app erpnext
    
    # Start development server
    bench start
}

# Main installation process
main() {
    echo "Starting ERPNext installation..."
    install_dependencies
    setup_mariadb
    install_bench
    
    echo "Installation complete! Access ERPNext at http://localhost:8000"
    echo "Default credentials:"
    echo "Username: Administrator"
    echo "Password: admin123"
}

# Run the installation
main
