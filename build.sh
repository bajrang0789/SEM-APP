# git checkout -b bpanigrah/build
git pull origin bpanigrah/build
gcloud config set project bajrang-444504
pushd sem-back-end
bash script.sh
popd
pushd sem-fornt-end
bash script.sh
popd

