const fs = require('fs');
const readline = require('readline');
const axios = require('axios');
const chalk = require('chalk');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const webhookUrl = config.webhook;
const message = config.message;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const asciiArt = `

╦ ╦┌─┐┌┐ ┬ ┬┌─┐┌─┐┬┌─   ╔═╗┌─┐┌─┐┌┬┐┌┬┐┌─┐┬─┐
║║║├┤ ├┴┐├─┤│ ││ │├┴┐   ╚═╗├─┘├─┤││││││├┤ ├┬┘
╚╩╝└─┘└─┘┴ ┴└─┘└─┘┴ ┴   ╚═╝┴  ┴ ┴┴ ┴┴ ┴└─┘┴└─
`;

async function showAscii() {
  const lines = asciiArt.split('\n');
  for (const line of lines) {
    console.log(chalk.blueBright(line));
    await wait(30);
  }
  console.log(chalk.cyan('[+] AstraWebhook By AstraxxTv\n'));
}

async function startLauncher() {
  console.clear();
  await showAscii();

  rl.question(chalk.cyan('[?] How many times do you want to spam the webhook? '), async (input) => {
    const count = parseInt(input);

    if (isNaN(count) || count <= 0) {
      console.log(chalk.red('[!] Invalid input. Please enter a positive number.'));
      rl.close();
      return;
    }

    console.log(chalk.green(`\n[#] Starting to send (${count} messages)...\n`));

    for (let i = 0; i < count; i++) {
      try {
        await axios.post(webhookUrl, { content: message });
        console.log(chalk.green(`[+] Message ${i + 1}/${count} sent.`));
      } catch (err) {
        const res = err.response;
        if (res && res.status === 429) {
          const retryAfter = res.data.retry_after || 1000;
          console.log(chalk.yellow(`[!] Rate limited, waiting ${retryAfter}ms...`));
          await wait(retryAfter);
          i--; 
        } else {
          console.error(chalk.red(`[!] Error sending message ${i + 1}:`), res?.data || err.message);
          break;
        }
      }
    }

    console.log(chalk.cyan('\n[✔] Operation completed.'));
    rl.close();
  });
}

startLauncher();
