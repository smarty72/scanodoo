# git remote add scanner git@git.evennode.com:81ce1f7c0ae2dbae4b0f5f0ace258932.git
# git rm -r --cached *.*
npm run build
git add .
git commit -am "v0.0.7"
#heroku login
git push scanodoo main -f -u
git push scanner main -f -u
#npx cap sync android
#npx cap open android