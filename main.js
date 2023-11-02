const core = require('@actions/core');
const { context } = require('@actions/github');
const { Octokit } = require('@octokit/rest');

const token = core.getInput('token');

const github = new Octokit({ auth: token });
const { owner, repo } = context.repo;
// TODO: Replace this with an input variable
const teams = [ // Using array of arrays because team names contain hyphen character, illegal json
  ['field-software-engineers', 'push'],
  ['integration-engineers', 'push'],
  ['private-access', 'pull'],
  ['release_builders', 'admin']
];

async function updateTeamPermissions(org, repoName) {
  try {
    teams.forEach(element => {
      console.log(element[0] + ' : ' + element[1])
      const team_slug = element[0];
      const permission = element[1];
      const response = github.request("PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}", {
        org,
        team_slug,
        owner,
        repo: repoName,
        permission
      });
    });
  }
  catch (error) {
    console.error('Error occurred:', error);
  }
}

updateTeamPermissions(owner, repoName);