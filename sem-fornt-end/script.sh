
docker build -t us-central1-docker.pkg.dev/bajrang-444504/sme/smart-expense-manager-fe:latest . --file DockerFile.frontend 
docker push us-central1-docker.pkg.dev/bajrang-444504/sme/smart-expense-manager-fe:latest

gcloud run deploy smart-expense-manager-fe \
    --image us-central1-docker.pkg.dev/bajrang-444504/sme/smart-expense-manager-fe:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
