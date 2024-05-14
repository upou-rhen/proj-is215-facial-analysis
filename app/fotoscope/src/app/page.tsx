'use client'

import Image from "next/image";
import { useState } from "react";
import Dropzone, { useDropzone } from 'react-dropzone'

export default function Home() {
  const [files, setFiles] = useState<any>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const {
    // acceptedFiles,
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxFiles: 1,
    onDrop(acceptedFiles, fileRejections, event) {
      setFiles(acceptedFiles)
    },
  });

  const handleClear = () => {
    setFiles([])
  }

  const handleGenerate = () => {
    setIsGenerating(true)
  }


  return (
    <main className="h-screen grid grid-rows-[auto_1fr]">
      <header className="h-[100px] w-full bg-white grid items-center p-4 box-border">
        <h4 className="text-black text-2xl">Fotoscope</h4>
      </header>
      <section className="grid grid-flow-col justify-center items-start mt-20 gap-10">
        <div {...getRootProps({ className: 'dropzone' })} className="border border-dashed min-h-[400px] grid place-items-center p-10 bg-slate-100/10">
          <div>
            <input {...getInputProps()} />
            <p>Drag {"'n'"} drop some files here, or click to select files</p>
            <em>(1 file and only *.jpeg and *.png images will be accepted)</em>
          </div>
        </div>
        {
          files.length ? <div>
            {files.map((item: any, index: string) => {
              const url = URL.createObjectURL(item)
              return (
                <Image src={url} alt="selected" key={index} width={600} height={600} />
              )
            })}
            <div className="grid grid-flow-col w-full justify-end gap-4 mt-4">
              <button disabled={isGenerating} type="button" className="h-8 p-2 px-4 grid place-items-center box-content bg-slate-500 disabled:bg-slate-500/45 rounded-sm min-w-[100px]" onClick={handleClear}>Clear</button>
              <button disabled={isGenerating} type="button" className="h-8 p-2 px-4 grid grid-flow-col gap-2 place-items-center box-content bg-blue-600 disabled:bg-blue-600/45 rounded-sm" onClick={handleGenerate}>
                {isGenerating ? <Loading /> : null}
                Generate news
              </button>
            </div>
          </div> : null
        }

      </section>
    </main>
  );
}


const Loading = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="animate-spin" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z" /></svg>
  )
}