var xmlhttp, xlmDoc;

window.onload = function () {
  fetch("https://taekwon.kim:3000/scores").then((response) => {
    return response.json();
  }).then((json) => {
    document.write("<table border='1'>");
    for (let item of json) {
      document.write("<tr><td>");
      document.write(item.name);
      document.write("</td><td>");
      document.write(item.score);
      document.write("</td></tr>");
    }
    document.write("</td></tr>");
  });
};
