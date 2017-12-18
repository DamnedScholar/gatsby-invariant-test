import React from "react";
import Helmet from "react-helmet";
import SocialLinks from "../components/SocialLinks/SocialLinks";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";
import "./b16-tomorrow-dark.css";
import "./page.css";

export default class PageTemplate extends React.Component {
  render() {
    // const { slug } = this.props.pathContext;
    // const pageNode = this.props.data.markdownRemark;
    // const page = pageNode.frontmatter;
    // if (!page.id) {
    //   page.id = slug;
    // }
    // return (
    //   <div>
    //     <Helmet>
    //       <title>{`${page.title} | ${config.siteTitle}`}</title>
    //     </Helmet>
    //     <SEO pagePath={slug} pageNode={pageNode} postSEO />
    //     <div>
    //       <h1>
    //         {page.title}
    //       </h1>
    //       <div dangerouslySetInnerHTML={{ __html: pageNode.html }} />
    //       <div className="page-meta">
    //         <SocialLinks pagePath={slug} pageNode={pageNode} />
    //       </div>
    //     </div>
    //   </div>
    // );

    return (
      <div>{JSON.stringify(this.props.data)}</div>
    )
  }
}

/* eslint no-undef: "off"*/
export const pageQuery = graphql`
query PageBySlug($slug: String!) {
  markdownRemark(fields: { slug: { eq: $slug } }) {
    html
    timeToRead
    excerpt
    frontmatter {
      title
      cover
      date
      category
      tags
    }
    fields {
      slug
    }
  }
}
`;
