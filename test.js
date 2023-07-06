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

async function getRepoTopics(owner, repo) {
  try {
    const { data: response } = await github.request("GET /repos/{owner}/{repo}/topics", {
      owner,
      repo
    });
    const repoTopics = response.names;
    return repoTopics;
  } catch (error) {
    core.setFailed(error.message);
  }
}
function permissionForTeam(team) {
  switch (team) {
    case 'integration-engineers':
      permission = 'push'
      break;
    case 'field-software-engineers':
      permission = 'push'
      break;
    case 'private-access':
      permission = 'pull'
      break;
    case 'release_builders':
      permission = 'admin'
      break;
    default:
      console.log(`Unknwon team name: ` + team);
  }
  return permission;
}

async function updateTeams(owner, repo) {
  try {
    getRepoTopics(orgName, repoName)
      .then((repoTopics) => {
        console.log(repoTopics);
        if (!repoTopics.includes('kf-customer-private')) {
          teams.forEach(element => {
            console.log(element[0] + ' : ' + element[1])
            const team_slug = element[0];
            const permission = element[1];
            const org = owner;
            console.log(`Repo: ${repoName}\nTeam: ${team_slug}\nPermission: ${permission}`)
          //  const response = github.request("PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}", {
          //    org,
          //    team_slug,
          //    owner,
          //    repo,
          //    permission
          //  });
          });
        } else {
          console.log('Skipping kf-customer-private repo: ' + repoName);
        }
      })
      .catch((err) => console.error(err));
  }
  catch (error) {
    core.setFailed(error.message);
  }
}
updateTeams(orgName, repoName)