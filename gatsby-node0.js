const fs = require("fs")
const path = require("path");
const _ = require("lodash");
const webpackLodashPlugin = require("lodash-webpack-plugin");

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators;
  let slug;
  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent);
    const parsedFilePath = path.parse(fileNode.relativePath);
    if (
      Object.prototype.hasOwnProperty.call(node, "frontmatter") &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, "slug")
    ) {
      slug = `/${_.kebabCase(node.frontmatter.slug)}`;
    }
    if (
      Object.prototype.hasOwnProperty.call(node, "frontmatter") &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, "title") &&
      node.frontmatter.title !== ""
    ) {
      slug = `/${_.kebabCase(node.frontmatter.title)}`;
    } else if (parsedFilePath.name !== "index" && parsedFilePath.dir !== "") {
      slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`;
    } else if (parsedFilePath.dir === "") {
      slug = `/${parsedFilePath.name}/`;
    } else {
      slug = `/${parsedFilePath.dir}/`;
    }
    createNodeField({ node, name: "slug", value: slug });

    // Custom query fields to enable individual templates to tell apart the various nodes.
    createNodeField({ node, name: "parsedFilePath", value: parsedFilePath });
    createNodeField({ node, name: "source", value: fileNode.sourceInstanceName });

    // This is for testing because it gives you all the information about a particular file. Useful if you want to make additions to the query results like I did above. I'm also forcing it into string form so that I don't have to remember all of the values.
    createNodeField({ node, name: "fileNode", value: fileNode });
    createNodeField({ node, name: "fileNodeString", value: JSON.stringify(fileNode) });
  }
};

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;

  return new Promise((resolve, reject) => {
    const page = path.resolve("src/templates/page.jsx");
    const postPage = path.resolve("src/templates/post.jsx");
    const tagPage = path.resolve("src/templates/tag.jsx");
    const categoryPage = path.resolve("src/templates/category.jsx");

    // Before automatically creating pages, I need to check for files in `src/pages/` and make an object representing the hierarchy so that I can compare that with each markdown file and override the ones that have a JS or JSX file.
    let src

    graphql(
      `{
        allFile {
          edges {
            node {
              sourceInstanceName
              relativePath
            }
          }
        }
      }`
    ).then(result => {
      if (result.errors) {
        /* eslint no-console: "off"*/
        console.log(result.errors);
        reject(result.errors);
      }

      data.allFile.edges.forEach(edge => {
        let path = edge.node.relativePath.split('/')
        if (edge.node.sourceInstanceName == "src")
          _.set(src, path, {})
      })
    })
    
    resolve(
      graphql(
        `{
          allMarkdownRemark {
            edges {
              node {
                frontmatter {
                  tags
                  category
                }
                fields {
                  slug
                }
              }
            }
          }
        }`
      ).then(result => {
        if (result.errors) {
          /* eslint no-console: "off"*/
          console.log(result.errors);
          reject(result.errors);
        }

        const tagSet = new Set();
        const categorySet = new Set();

        result.data.allMarkdownRemark.edges.forEach(edge => {
          if (edge.node.frontmatter.tags)
            edge.node.frontmatter.tags.forEach(tag => {
              tagSet.add(tag);
            });

          if (edge.node.frontmatter.category)
            categorySet.add(edge.node.frontmatter.category)

          let component
          if (edge.node.fields.source == "pages")
            component = page;
          else
            component = postPage

          let path = edge.node.fields.slug.split('/').unshift('pages')
          if (typeof _.get(src, path, false) === 'object') {
            var output = "Duplicate page found at " + JSON.stringify(path) + "."

            fs.appendFile('create-page-log.txt', output, (err) => {
              console.log(err)
            })

            return
          }
          else
            createPage({
              path: edge.node.fields.slug,
              component: component,
              context: {
                slug: edge.node.fields.slug
              }
            });
        });

        const tagList = Array.from(tagSet);
        tagList.forEach(tag => {
          createPage({
            path: `/tags/${_.kebabCase(tag)}/`,
            component: tagPage,
            context: {
              tag
            }
          });
        });

        const categoryList = Array.from(categorySet);
        categoryList.forEach(category => {
          createPage({
            path: `/categories/${_.kebabCase(category)}/`,
            component: categoryPage,
            context: {
              category
            }
          });
        });
      })
    );
  });
};

exports.modifyWebpackConfig = ({ config, stage }) => {
  if (stage === "build-javascript")
    config.plugin("Lodash", webpackLodashPlugin, null);
};
