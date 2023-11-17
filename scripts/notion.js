const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const slugify = require('slugify');
const _ = require('lodash')
const fs = require('fs');
const path = require("path");
const crypto = require('crypto');
const { findUrl } = require("./utils");
const { downloadImage } = require("./utils");

const notion = new Client({
    auth: "secret_AWlZT3KZBsAIDIFzsQh8K8anHr8ZszAiLP4Me9SNapK",
});

const POSTS_DIR = path.join(__dirname, '..', 'content', 'posts');

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion, config: { convertImagesToBase64: false, parseChildPages: true, separateChildPage: false } });



(async () => {
    // Retrieve database and its pages
    const queryDbResponse = await notion.databases.query({
        page_size: 100,
        database_id: 'de3fc755f816457ba92cd89da40fa48b',
    });

    console.log('Databse Query done')

    fs.writeFileSync('ndata.txt', JSON.stringify(p.results, null, 4));

    console.log('Response saved')

    await handleResults(queryDbResponse);
})();


async function handleResults(database) {
    await Promise.all(database.results.map(async (r) => {
        const { title, createdAt, tags, icon, coverUrl } = getData();

        const page = {};

        page.title = title;
        page.slug = slugify(title.toLowerCase());
        page.createdAt = createdAt;
        page.tags = tags;
        page.icon = icon;
        page.coverUrl = coverUrl;

        const { coverImg, pageDir, pageImgDir, notionFile } = getDirs();

        downloadImage(coverImg, page.coverUrl);

        fs.mkdirSync(pageDir, { recursive: true });
        fs.mkdirSync(pageImgDir, { recursive: true });

        const { results } = await notion.blocks.children.list({
            block_id: r.id
        });

        await Promise.all(results.map(async (blk) => {
            let filePath = null;
            if (blk.type == 'image') {
                const fileName = crypto.randomUUID() + '.jpg';
                filePath = downloadImage(path.join(pageImgDir, fileName), findUrl(blk.image));

                if (blk.image.file) {
                    blk.image.file.url = 'assets/' + fileName;
                } else if (blk.image.external) {
                    blk.image.external.url = 'assets/' + fileName;
                }
            }
            else if (blk.type == 'video') {
                // filePath = await downloadImage(pageImgDir, findUrl(blk.video));
                // console.log(filePath)
            } else if (blk.type == 'embed') {
                console.log(JSON.stringify(blk, null, 2));
            }
        }));

        // convert to markdown
        const mdBlocks = await n2m.blocksToMarkdown(results);

        const mdString = n2m.toMarkdownString(mdBlocks);

        page.md = mdString.parent;

        const indexPage = path.join(pageDir, 'index.md');

        const data = `+++
categories = ['Journal']
date = '${page.createdAt}'
title = "${page.title}"
tags = [${page.tags}]
icon = '${page.icon}'
draft = false
+++
${page.md}
`;

        const notionMeta = `${r.id}
${title}
`;

        fs.writeFileSync(indexPage, data);
        fs.writeFileSync(notionFile, notionMeta);

        function getDirs() {
            const pageDir = path.join(POSTS_DIR, page.slug);
            const coverImg = path.join(pageDir, 'featured.jpg');
            const notionFile = path.join(pageDir, '.notion');
            const pageImgDir = path.join(pageDir, 'assets');
            return { coverImg, pageDir, pageImgDir, notionFile };
        }

        function getData() {
            const title = r.properties.Name.title[0].text.content;
            const tags = r.properties.Tags.multi_select.map(ms => `'${ms.name}'`).join(',');
            const date = new Date(r.properties.Created.created_time);
            const icon = r.icon ? r.icon.emoji : '';
            const coverUrl = r.cover ? (r.cover.external ? r.cover.external.url : r.cover.file.url) : '';

            const createdAt = date.toISOString().split('T')[0];
            return { title, createdAt, tags, icon, coverUrl };
        }
    }));
}
