import { Header } from '../components/Header/index'

import { GetStaticProps } from 'next';
import Link from 'next/link';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const {results, next_page} = postsPagination 
  const result = results.map(result => ({
    ...result,
  }))

  const [posts, setPosts] = useState<Post[]>(result);
  const [nextPost, setNextPost] = useState(next_page);
  
  async function handleNextPosts(): Promise<void> {
    
    const nextPosts = await fetch(nextPost).then(response =>
      response.json()
    );

    //console.log(nextPosts)

    setPosts([...posts, ...nextPosts.results]);
    setNextPost(nextPosts.next_page);

  }

  return (
      <>
        <main className={styles.container}>
            <Header />
            <div className={styles.posts}>
                {posts.map(post => (
                  <Link href={`/posts/${post.uid}`}>
                      <a key={post.uid}>
                        <strong>{post.data.title}</strong>
                        <p>{post.data.subtitle}</p>
                        <time>
                            {format(
                              parseISO(post.first_publication_date),
                              "dd MMM' 'yyyy",
                              {
                                locale: ptBR,
                              }
                            )}
                         </time>
                        <address>{post.data.author}</address>
                      </a>
                  </Link>
                ))}

                <button type="button" onClick={handleNextPosts} disabled={nextPost === null}>Carregar mais posts</button>
            </div>
        </main>
      </>
  )
} 

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
});

const postList = postsResponse.results.map(post => {
  return {
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    }
  };
});

const postsPagination = {
  next_page: postsResponse.next_page,
  results: postList,
}

return {
    props: {
      postsPagination,
    }
  }
};
