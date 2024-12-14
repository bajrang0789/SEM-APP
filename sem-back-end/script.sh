gcloud auth configure-docker
docker build -t us-central1-docker.pkg.dev/bajrang-444504/sme/smart-expense-manager-be:latest . --file DockerFile.backend 
docker push us-central1-docker.pkg.dev/bajrang-444504/sme/smart-expense-manager-be:latest
gcloud run deploy smart-expense-manager-be \
    --image us-central1-docker.pkg.dev/bajrang-444504/sme/smart-expense-manager-be:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 3030