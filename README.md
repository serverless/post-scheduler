# Static Site Post Scheduler

Like many static site's we use markdown + github for all of our [blog content](https://github.com/serverless/blog/).

Having content under version control comes with some great benefits:

- Anyone can submit content, fix typos & update anything via pull requests
- Version control - Roll back & see the history of any given post
- No CMS lock in - We can easily port to any static site generator
- It's just simple - No user accounts to manage, no CMS software to upgrade, no plugins to install.

All that said, there are some missing features when it comes to running your blog via a static site generator.

The biggest missing feature is the ability to schedule posts to publish at a specific time.

**Not anymore baby!**

Until now, publishing a post was a manual process of merging a post branch into the `master` branch of our [blog repo](https://github.com/serverless/blog/).

While not the end of the world, it was an inconvenience for our content team needing to be awake super early to manually click a button.

I thought to myself, there has got to be a better way... a better **serverless** way.

## Introducing the post-scheduler

The post scheduler is another serverless project that demonstrates how event driven functions can be setup and deployed to do your bidding.

## How does it work?

1. A github webhook fires when pull requests are updated.

2. If the pull request comment has the `schedule(MM/DD/YYYY H:MM pm)` pattern in it and the person is a collaborator on the project, the post gets scheduled

3. A serverless cron job runs every hour to check if a post is ready to be published

4. When the post is ready to be published, the cron function automatically merges the branch into `master`

Thats it!

## install

1. Clone down the repository and run `npm install` to instal the dependencies

2. Duplicate `config.prod.example.json` into a new file called `config.prod.json` and insert your Github username, API token, and webhook secret

```json
{
  "serviceName": "blog-scheduler",
  "region": "us-west-2",
  "GITHUB_REPO": "serverless/blog",
  "GITHUB_WEBHOOK_SECRET": "YOUR_GITHUB_WEBHOOK_SECRET_HERE",
  "GITHUB_API_TOKEN": "YOUR_GITHUB_API_TOKEN_HERE",
  "GITHUB_USERNAME": "YOUR_GITHUB_USERNAME_HERE"
}
```

3. Deploy the service with `serverless deploy`

4. Take the POST endpoint returned from deploy and plug it into your repositories settings

## Recap

**Before:**

We needed someone to manually merge a post into the `master` branch of our site. **Boo 🙈***

**After:**

We are sipping margaritas on the beach while posts are being published automatically. **Yay 🎉***

# Potential Names

- lineup
- pipeline
