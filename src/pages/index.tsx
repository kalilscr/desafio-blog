import { Header } from '../components/Header/index'

import { GetStaticProps } from 'next';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  return (
      <>
        <main className={styles.container}>
            <Header />
            <div className={styles.posts}>
                <strong>{}</strong>
                <p>subtittulo subtittulosubtittulosubtittulosubtittulosubtittulosubtittulosubtittulosubtittulo</p>
                <time>30 Mar 2077</time>
                <address>john doe</address>

                <button type="button">Carregar mais posts</button>
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

const postList = postsResponse.results.map(posts => {
  return {
    uid: posts.uid,
    first_publication_date: new Date(posts.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    data: {
      title: posts.data.title,
      subtitle: posts.data.subtitle,
      author: posts.data.author,
    }
  };
});

return {
    props: {
      postList,
    }
  }
};
