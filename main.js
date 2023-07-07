const fs = require('fs');
const core = require('@actions/core');
const { Octokit } = require("@octokit/rest");

const TOKEN = process.env.GITHUB_TOKEN;
const orgName = 'keyfactor'
const repoName = core.getInput('repo-name') || process.env.REPONAME;

const teams = [ // Using array of arrays because team names contain hyphen character, illegal json
  ['field-software-engineers', 'push'],
  ['integration-engineers', 'push'],
  ['private-access', 'pull'],
  ['release_builders', 'admin']
];

const github = new Octokit({
  auth: TOKEN,
});

async function updateTeamPermissions(owner, repo) {
  try {
    teams.forEach(element => {
      console.log(element[0] + ' : ' + element[1])
      const team_slug = element[0];
      const permission = element[1];
      const org = owner;
      const response = github.request("PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}", {
        org,
        team_slug,
        owner,
        repo,
        permission
      });
    });
  }
  catch (error) {
    console.error('Error occurred:', error);
  }
}

async function updateRepoTeams(owner, repo) {
  try {
    const { data: response } = await github.rest.repos.get({
      owner,
      repo
    });
    const { topics } = response;
    outText = JSON.stringify(response, '', 2);
    console.log(`outText: ${outText}`);
    topics.indexOf('kf-customer-private') > 0 ? console.log('PRIVATE') : updateTeamPermissions(owner, repo);
  } catch (error) {
    core.setFailed(error.message);
  }
}

updateRepoTeams(orgName, repoName);