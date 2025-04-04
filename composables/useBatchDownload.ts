import JSZip from "jszip";
import {saveAs} from "file-saver";
import {format} from 'date-fns';
import {downloadArticleHTMLs, packHTMLAssets} from "~/utils";
import type {DownloadableArticle} from "~/types/types";


/**
 * 批量下载缓存文章
 * @param articles
 * @param filename
 */
export function useBatchDownload() {
    const loading = ref(false)
    const phase = ref()
    const downloadedCount = ref(0)
    const packedCount = ref(0)

    async function download(articles: DownloadableArticle[], filename: string) {
        loading.value = true
        try {
            phase.value = '下载文章内容'
            const results = await downloadArticleHTMLs(articles, (count: number) => {
                downloadedCount.value = count
            })

            // 对文章进行分批处理，每批处理的文章数量
            const BATCH_SIZE = 100; // 可以根据实际情况调整
            const batches = [];
            
            // 将文章分成多个批次
            for (let i = 0; i < results.length; i += BATCH_SIZE) {
                batches.push(results.slice(i, i + BATCH_SIZE));
            }
            
            // 处理每个批次
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                phase.value = `打包 (批次 ${batchIndex + 1}/${batches.length})`;
                
                const zip = new JSZip();
                for (const article of batch) {
                    await packHTMLAssets(article.html!, article.title.replaceAll('.', '_'), zip.folder(format(new Date(article.date * 1000), 'yyyy-MM-dd') + ' ' + article.title.replace(/\//g, '_'))!);
                    packedCount.value++;
                }
                
                // 为每个批次生成单独的zip文件
                const batchFilename = batches.length > 1 
                    ? `${filename}_part${batchIndex + 1}of${batches.length}.zip` 
                    : `${filename}.zip`;
                const blob = await zip.generateAsync({type: 'blob'});
                saveAs(blob, batchFilename);
                
                // 释放内存
                zip.files = {};
            }
        } catch (e: any) {
            alert(e.message)
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        phase,
        downloadedCount,
        packedCount,
        download,
    }
}

/**
 * 批量下载合集文章
 */
export function useDownloadAlbum() {
    const loading = ref(false)
    const phase = ref()
    const downloadedCount = ref(0)
    const packedCount = ref(0)

    async function download(articles: DownloadableArticle[], filename: string) {
        loading.value = true

        try {
            phase.value = '下载文章内容'
            const results = await downloadArticleHTMLs(articles, (count: number) => {
                downloadedCount.value = count
            })

            // 对文章进行分批处理，每批处理的文章数量
            const BATCH_SIZE = 5; // 可以根据实际情况调整
            const batches = [];
            
            // 将文章分成多个批次
            for (let i = 0; i < results.length; i += BATCH_SIZE) {
                batches.push(results.slice(i, i + BATCH_SIZE));
            }
            
            // 处理每个批次
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                phase.value = `打包 (批次 ${batchIndex + 1}/${batches.length})`;
                
                const zip = new JSZip();
                for (const article of batch) {
                    await packHTMLAssets(article.html!, article.title.replaceAll('.', '_'), zip.folder(format(new Date(+article.date * 1000), 'yyyy-MM-dd') + ' ' + article.title.replace(/\//g, '_'))!);
                    packedCount.value++;
                }
                
                // 为每个批次生成单独的zip文件
                const batchFilename = batches.length > 1 
                    ? `${filename}_part${batchIndex + 1}of${batches.length}.zip` 
                    : `${filename}.zip`;
                const blob = await zip.generateAsync({type: 'blob'});
                saveAs(blob, batchFilename);
                
                // 释放内存
                zip.files = {};
            }
        } catch (e: any) {
            alert(e.message)
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        phase,
        downloadedCount,
        packedCount,
        download,
    }
}
