#!/bin/bash

# Install Docker if not installed
install_docker() {
    echo "Installing Docker..."
    sudo apt update
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
}

# Install Docker Compose if not installed
install_docker_compose() {
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
}

# Clone ERPNext Docker repository
setup_erpnext() {
    echo "Setting up ERPNext..."
    git clone https://github.com/frappe/frappe_docker.git
    cd frappe_docker
    cp example.env .env
    
    # Modify environment file
    sed -i 's/ERPNEXT_VERSION=.*/ERPNEXT_VERSION=v15.0.0/g' .env
    
    # Start ERPNext
    docker-compose -f compose.yaml up -d
    
    echo "Waiting for ERPNext to start (this may take several minutes)..."
    sleep 60
    
    # Create a new site
    docker-compose -f compose.yaml exec backend bench new-site mysite.local --admin-password admin --db-root-password admin
    docker-compose -f compose.yaml exec backend bench --site mysite.local install-app erpnext
    docker-compose -f compose.yaml exec backend bench --site mysite.local enable-scheduler
    docker-compose -f compose.yaml restart backend
}

# Main installation process
main() {
    echo "Starting ERPNext installation using Docker..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        install_docker
    else
        echo "Docker is already installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        install_docker_compose
    else
        echo "Docker Compose is already installed"
    fi
    
    setup_erpnext
    
    echo "Installation complete! Access ERPNext at http://localhost:8000"
    echo "Default credentials:"
    echo "Username: Administrator"
    echo "Password: admin"
}

# Run the installation
main
