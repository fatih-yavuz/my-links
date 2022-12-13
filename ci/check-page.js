const fs = require('fs');
const url = require('url');
const axios = require('axios');
const yaml = require('js-yaml');

async function validateJson() {
    try {
        const isCI = process.env.CI;
        let path = isCI ? 'page.json' : '../page.json';
        const pageJsonString = fs.readFileSync(path, 'utf8');

        // Try to parse the JSON string
        const pageJson = JSON.parse(pageJsonString);

        // Validate the URLs in the links array
        for (const link of pageJson.links) {
            try {
                url.parse(link.url);
                console.log(`URL "${link.url}" is valid`);
            } catch (error) {
                console.error(`URL "${link.url}" is invalid:`, error.message);
                process.exit(1);
            }

            // Fetch the remote YAML file using Axios
            try {
                const response = await axios.get('https://raw.githubusercontent.com/fatih-yavuz/links.dev/main/available-icons.yaml');

                // Parse the YAML file
                const yamlData = yaml.load(response.data);

                // Check if the icon is in the list of available icons
                if (yamlData.icons.includes(link.icon)) {
                    console.log(`Icon "${link.icon}" is valid`);
                } else {
                    console.error(`Icon "${link.icon}" is invalid`);
                    process.exit(1);
                }
            } catch (error) {
                console.error('Error fetching or parsing YAML file:', error.message);
                process.exit(1);
            }
        }
    } catch (error) {
        console.error('JSON is invalid:', error.message);
        process.exit(1);
    }
}


validateJson();
