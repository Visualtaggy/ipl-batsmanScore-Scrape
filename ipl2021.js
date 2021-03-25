let cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");
let p = require("path");

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

//directly going to result page
url = url + "/match-results";

request(url, cb);
function cb(error, response, html) {
  if (error) {
    System.out.println(error);
  } else {
    webScrape(html);
  }
}

function webScrape(html) {
  let select_tool = cheerio.load(html);
  let rawTeamNames = select_tool("p.name");
  let scoreCards = select_tool("a[data-hover=Scorecard]");
  let names = [];
  //Looping over all names
  for (let i = 0; i < rawTeamNames.length; i++) {
    names = select_tool(rawTeamNames[i]).text();
    //Create folder function handles duplicate entries
    createFolders(names);
  }
  //ScoreCard
  for (let i = 0; i < scoreCards.length; i++) {
    links = select_tool(scoreCards[i]).attr("href");
    //adding base link
    console.log("https://www.espncricinfo.com" + links);
  }
}

function createFolders(folderName) {
  let path = p.join(__dirname, folderName);
  //handling duplicate entries  using if statement
  if (fs.existsSync(path) == false) {
    fs.mkdirSync(path);
  }
}
