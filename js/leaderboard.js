var xmlhttp, xlmDoc;

window.onload = function () {
  fetch("https://taekwon.kim:3000/scores").then((response) => {
    return response.json();
  }).then((json) => {
    let table = document.getElementById("leaderboardTable");
    for (let item of json) {
      let newRow = table.insertRow();
      let nameCell = newRow.insertCell(0);
      let scoreCell = newRow.insertCell(1);

      nameCell.appendChild(document.createTextNode(item.name));
      scoreCell.appendChild(document.createTextNode(item.score + " seconds"));
    }
  });
};
