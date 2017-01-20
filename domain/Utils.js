var Utils = Utils || {};

Utils.removeHTMLTags = function(html) {
	var regexp = /<[^>]*>/g;
	return html.replace(regexp, "");
}

Utils.deepReplace = function(pattern, rep, text) {
	var oldLength = text.length;
	var string = text.replace(pattern, rep);
	var newLength = string.length;

	while (oldLength !== newLength) {
		oldLength = string.length;
		string = string.replace(pattern, rep);
		newLength = string.length;
	}
	return string;
}

// exports = Utils;
exports.removeHTMLTags = Utils.removeHTMLTags;
exports.deepReplace = Utils.deepReplace;

