let cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");
let p = require("path");

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";


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
  let scoreCards = select_tool("a[data-hover=Scorecard]");

  for (let i = 0; i < scoreCards.length; i++) {
    links = select_tool(scoreCards[i]).attr("href");

    batsmanScrapper("https://www.espncricinfo.com" + links);
  }
}

function createFolders(folderName) {
  let path = p.join(__dirname, folderName);
  //handling duplicate entries  using if statement
  if (fs.existsSync(path) == false) {
    fs.mkdirSync(path);
  }
}

function batsmanScrapper(link) {
  request(link, cb);

  function cb(error, response, html) {
    if (error) {
      console.log(error);
    } else {
      primaryFunction(html);
    }
  }

  function primaryFunction(html) {
    let selTool = cheerio.load(html);
    let teams = selTool(".Collapsible h5.header-title.label");
    let teamName = [];
    teamName[0] = acronym(selTool(teams[0]).text().split("INNINGS")[0].trim());
    teamName[1] = acronym(selTool(teams[1]).text().split("INNINGS")[0].trim());

    createFolders(teamName[0]);
    createFolders(teamName[1]);

    let tablesBatsman = selTool(".table.batsman");
    for (let i = 0; i < tablesBatsman.length; i++) {
      let tableRowDetail = selTool(tablesBatsman[i]).find("tbody tr");
      for (let j = 0; j < tableRowDetail.length - 1; j++) {
        let tableColumn = selTool(tableRowDetail[j]).find("td");
        let name = selTool(tableColumn[0]).find("a").text().trim();
        let extraChar = selTool(tableColumn[0]).find("a span").text().trim();
        let batsmanName = "";
        if (extraChar.length > 0) {
          batsmanName = name.replace(extraChar, "").trim();
        } else {
          batsmanName = name.trim();
        }

        if (batsmanName != "") {
          let opponent = i == 0 ? teamName[1] : teamName[0];
          let description = selTool(".event .description").text();
          let matchDesc = description.split(",");
          matchObj = {
            runs: selTool(tableColumn[2]).text().trim(),
            balls: selTool(tableColumn[3]).text().trim(),
            fours: selTool(tableColumn[5]).text().trim(),
            sixes: selTool(tableColumn[6]).text().trim(),
            sr: selTool(tableColumn[7]).text().trim(),
            date: matchDesc[2].trim(),
            venue: matchDesc[1].trim(),
            result: selTool(".event .status-text").text().trim(),
            opponentName: opponent,
          };
          makeJSON(batsmanName, teamName[i], matchObj);
        }
      }
    }
  }
}

function acronym(text) {
  return text.split(/\s/).reduce(function (accumulator, word) {
    return accumulator + word.charAt(0);
  }, "");
}

function makeJSON(batsmanName, teamName, matchObj) {
  let folderPath = p.join(__dirname, teamName);
  let filePath = p.join(folderPath, batsmanName + ".json");

  if (fs.existsSync(filePath) == false) {
    let arr = [];
    arr.push(matchObj);
    let createStream = fs.createWriteStream(filePath);
    createStream.end();
    fs.writeFileSync(filePath, JSON.stringify(arr));
  } else {
    fs.readFile(filePath, "utf-8", function (err, data) {
      if (err) {
        console.log(err);
      } else {
        var json = JSON.parse(data);
        var arr = [];
        for (let i = 0; i < json.length; i++) {
          arr.push(json[i]);
        }
        arr.push(matchObj);

        fs.writeFileSync(filePath, JSON.stringify(arr));
      }
    });
  }
}
