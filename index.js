import express from "express";
import clm from "country-locale-map";
import geoip from "fast-geoip";
import ipaddrJs from "ipaddr.js";
import publicIp from "public-ip";

const app = express();

app.set("trust proxy", true);

const isIpPublic = (ip) => {
	const range = ip.range();

	for (const type of [
		"unspecified",
		"broadcast",
		"linkLocal",
		"loopback",
		"private",
		"reserved"
	]) {
		if (range === type) {
			return false;
		}
	}

	return true;
};

app.get("/", async (req, res) => {
	let ip = ipaddrJs.parse(req.ip);
	if (ip?.isIPv4MappedAddress?.()) {
		ip = ip.toIPv4Address();
	}

	if (isIpPublic(ip)) {
		ip = ip.toString()
	} else {
		ip = await Promise.any([
			publicIp.v4(),
			publicIp.v6()
		]);
	}

	const geoipdata = await geoip.lookup(ip),
		locale = clm.getCountryByAlpha2(geoipdata.country).default_locale.replaceAll('_', '-'),
		date = new Date(),
		datestring = date.toLocaleString(locale, { timeZone: geoipdata.timezone });

	const data = "<p>IP: " + ip + "</p>"
		+ "<p>Strefa czasowa: " + geoipdata.timezone + "</p>"
		+ "<p>" + datestring + "</p>";

	res.status(200).send(data);
});

app.listen(80,  () => {
	const date = new Date(),
		datestring = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`;

	console.log("Serwer WWW uruchomiony na porcie 80");
	console.log(datestring);
	console.log("Autor Krzysztof Zarębski");
});
