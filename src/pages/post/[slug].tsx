import { GetStaticPaths, GetStaticProps } from 'next';
import React, { useState } from 'react';
import Header from '../../components/Header';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Head from 'next/head';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}


 export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter()
  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  function readingTime() {
    
    const text = post.data.content.map(content => content.body.map(content => content.text)); // fetch the article text so we can preform the calculations.  
    const heading = post.data.content.map(content => content.heading)                         // fetch the article text so we can preform the calculations.  
    text.push(heading)                          
    const time = Math.ceil(String(text).trim().split(/\s+/).length / 200);   // calculates the read time rounded up to the nearest whole number.( calculate total number of words (length) by splitting at each whitespace. / 200 = average adult reading speed (words per minute).)                    
    return time;
  }
  
  
  return (
    <>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>
      
      <Header />
      <img src={post.data.banner.url} alt="banner" className={styles.banner}/>
      <main className={commonStyles.container}>  
        <article className={styles.article}> 
            <h1>{post.data.title}</h1>
            <FiCalendar />
            <time>
                {format(
                  parseISO(post.first_publication_date),
                  "dd MMM' 'yyyy",
                  {
                    locale: ptBR,
                  }
                )}
            </time>
            <FiUser />
            <address>
              {post.data.author}
            </address>
            <FiClock />
            <span>{readingTime()} min</span>

            
            
            {post.data.content.map(content => (
              <section key={content.heading}>
                <h2>{content.heading}</h2>
                <article 
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
                />
              </section>
            ))}
        </article>
      </main>
    </>
  )
 }

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({
    params: { 
      slug: post.uid 
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID("posts", String(slug), {});
  
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30 // 30 min
  };
};
