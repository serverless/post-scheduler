<p align="center">
  <img width="415" height="204" src="https://cloud.githubusercontent.com/assets/532272/23386639/779ce26c-fd0c-11e6-9e54-f33281e17719.jpg">
</p>

# Static Site Post Scheduler

The post scheduler is a [serverless](https://github.com/serverless/serverless) project that gives static site owners the ability to schedule posts (or other site content).

It works with any static site setup (Jekyll, Hugo, Phenomic, Gatsby etc.)

[Video demo](https://www.youtube.com/watch?v=YETxuhexZY4&index=1&list=PLIIjEI2fYC-BubklemD4D51vrXHOcUOpc&t=31s)

## How does it work?

<img align="right" width="500" height="313" src="https://cloud.githubusercontent.com/assets/532272/23643861/250f2ca0-02b9-11e7-9a1b-94676043f2aa.gif">

1. A github webhook fires when pull requests (aka new posts) are updated.

2. If the pull request comment has a comment matching `schedule(MM/DD/YYYY H:MM pm)` and the person is a collaborator on the project, the post gets scheduled for you.

3. A serverless cron job runs every hour to check if a post is ready to be published

4. When the post is ready to be published, the cron function automatically merges the branch into `master` and your site, if you have CI/CD built in, will redeploy itself.

To cancel scheduled posts, delete the scheduled comment and it will unschedule the branch.

### Github Webhook Architecture Overview

![cloudcraft - post scheduler webhook](https://cloud.githubusercontent.com/assets/532272/23387076/2e7960b2-fd0f-11e6-88da-49517b27d8ae.png)

### Cron Job Architecture Overview

![cloudcraft - post scheduler cron setup](https://cloud.githubusercontent.com/assets/532272/23388042/e129772e-fd14-11e6-96ca-ff23a019a51e.png)

## Install Instructions

You will need the [serverless framework installed and an AWS account configured](https://github.com/serverless/serverless#quick-start) on your computer to deploy this for your repo.

```bash
npm install serverless -g
```

Then [watch the scheduler setup and usage videos](https://www.youtube.com/watch?v=YETxuhexZY4&index=1&list=PLIIjEI2fYC-BubklemD4D51vrXHOcUOpc) or follow the instructions below.

1. Clone down the repository and run `npm install` to instal the dependencies

2. Duplicate `config.prod.example.json` into a new file called `config.prod.json` and insert your Github username, API token, and webhook secret


  ```json
  // config.prod.json
  {
    "serviceName": "blog-scheduler",
    "region": "us-west-2",
    "TIMEZONE": "America/Los_Angeles",
    "CRON": "cron(0 * * * ? *)",
    "GITHUB_REPO": "serverless/blog",
    "GITHUB_WEBHOOK_SECRET": "YOUR_GITHUB_WEBHOOK_SECRET_HERE",
    "GITHUB_API_TOKEN": "YOUR_GITHUB_API_TOKEN_HERE",
    "GITHUB_USERNAME": "YOUR_GITHUB_USERNAME_HERE"
  }
  ```

  - `serviceName` - name of the service that will appear in your AWS account
  - `region` - AWS region to deploy the functions and database in
  - `TIMEZONE` - Timezone the cron runs on. See `timezone.json` for available options
  - `CRON` - How often you want to check for scheduled posts? See the [AWS cron docs](http://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html) or [serverless `schedule` docs](https://serverless.com/framework/docs/providers/aws/events/schedule/) for more information. **Default:** every hour on the hour
  - `GITHUB_REPO` - The `owner/repoName` of your repository
  - `GITHUB_WEBHOOK_SECRET` - Any string you want. This gets plugged into your webhook settings
  - `GITHUB_API_TOKEN` - Personal access token. See below for additonal info
  - `GITHUB_USERNAME` - Your github username. Used for requests to github


3. Deploy the service with `serverless deploy`. If you need to setup serverless, please see [these install instructions](https://github.com/serverless/serverless#quick-start).

4. Take the POST endpoint returned from deploy and plug it into your [repositories settings in github](https://youtu.be/b_DVXgiByec?t=1m9s)

  ![image](https://cloud.githubusercontent.com/assets/532272/23144203/e0dada50-f77a-11e6-8da3-7bdbcaf8f2a0.png)

  1. Add your github webhook listener URL into the `Payload URL` and choose type `application/json`

  2. Plugin your `GITHUB_WEBHOOK_SECRET` defined in your config file

  3. Select which github events will trigger your webhook

  4. Select Issue comments, these will be where you insert `schedule(MM/DD/YYYY H:MM pm)` comments in a given PR

5. Submit a PR and give it a go!

## Contributions Welcome

Have an idea on how we can improve the static site post scheduler?

[Submit a PR](https://github.com/serverless/post-scheduler/), post an issue or tweet [@DavidWells](https://twitter.com/davidwells)
