pipeline {
    agent any

    stages {
        stage('Pull code from develop') {
            steps {
                git branch: 'develop', url: 'https://github.com/Quizzfly/quizzfly-server.git'
            }
        }

        stage('Build & Deploy with Docker Compose') {
            steps {
                sh 'docker-compose up --build -d'
            }
        }

        stage('Cleanup Unused Docker Images') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }

    post {
        always {
            echo '=== Docker Compose Logs ==='
            sh 'docker-compose logs'
        }
    }
}
