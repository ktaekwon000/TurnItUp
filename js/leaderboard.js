var xmlhttp, xlmDoc;

window.onload = function () {
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open(
    "GET",
    "https://dreamlo.com/lb/5ff83c4c0af26924d032efa1/xml-asc",
    false
  );
  xmlhttp.send();
  xmlDoc = xmlhttp.responseXML;

  document.write("<table border='1'>");
  var x = xmlDoc.getElementsByTagName("CD");
  for (i = 0; i < x.length; i++) {
    document.write("<tr><td>");
    document.write(
      x[i].getElementsByTagName("entry")[0].childNodes[0].nodeValue
    );
    document.write("</td><td>");
    document.write(
      x[i].getElementsByTagName("score")[0].childNodes[0].nodeValue
    );
    document.write("</td></tr>");
  }
  document.write("</table>");
};
