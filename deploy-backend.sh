#!/bin/bash
# deploy-backend.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Función para validar argumentos
validate_args() {
    if [ $# -ne 1 ]; then
        error "Usage: $0 <environment>"
        error "Environment: dev, qa, prod"
        exit 1
    fi
}

# Función para validar entorno
validate_environment() {
    local env=$1
    case $env in
        dev|qa|prod)
            log "Deploying backend to $env environment"
            ;;
        *)
            error "Invalid environment: $env"
            error "Valid environments: dev, qa, prod"
            exit 1
            ;;
    esac
}

# Función para construir y push de imagen Docker
build_and_push() {
    local env=$1
    local image_name="edwardsalinas/calendar-backend"
    
    log "Building Docker image for backend in $env environment"
    
    # Construir imagen
    docker build -t "${image_name}:${env}" \
                 -t "${image_name}:latest" \
                 --build-arg NODE_ENV=$env \
                 .
    
    # Push a Docker Hub
    log "Pushing image to Docker Hub"
    docker push "${image_name}:${env}"
    
    if [ "$env" == "prod" ]; then
        docker push "${image_name}:latest"
    fi
    
    log "Image pushed successfully: ${image_name}:${env}"
}

# Función principal
main() {
    validate_args "$@"
    
    local environment=$1
    
    validate_environment $environment
    
    # Cargar variables de entorno
    if [ -f ".env.$environment" ]; then
        source ".env.$environment"
        log "Loaded environment variables from .env.$environment"
    else
        warn "No .env.$environment file found"
    fi
    
    # Login a Docker Hub
    log "Logging into Docker Hub"
    echo "$DOCKER_PASSWORD" | docker login -u edwardsalinas --password-stdin
    
    # Construir y push imagen
    build_and_push $environment
    
    log "Backend deployment completed successfully!"
}

# Ejecutar función principal
main "$@"