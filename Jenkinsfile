pipeline {
    agent any

    stages {
        stage('Build & Deploy with Docker Compose') {
            steps {
                sh 'docker compose up --build -d quizzfly-api'
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
            sh 'docker compose logs'
        }
    }
}
