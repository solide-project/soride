"use client"

import { useEffect, useState } from "react"
import { Check, Download, FileBox, FilePlus, FolderClosed, FolderOpen, FolderPlus, Icon, Trash } from "lucide-react"

import { isVFSFile, VFSFile, VFSNode } from "@/lib/core/file-system/interfaces"
import path from "path"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuShortcut,
} from "@/components/ui/context-menu"
import { Input } from "../../ui/input"
import {
    FileTreeContextMenuSubTrigger,
    FileTreeContextMenuItem
} from "@/components/core/file/fs-context-menu"
import { Title } from "@/components/core/components/title"
import { useLogger } from "@/components/core/providers/logger-provider"
import { useFileSystem } from "@/components/core/providers/file-provider"
import { useEditor } from "@/components/core/providers/editor-provider"
import { downloadBlob, zipSources } from "@/lib/core"
import { FileIcon } from "./icon"

interface FileTreeNodeProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string
    directory: string
    node: VFSNode | VFSFile
    depth: number
}

const menuClass = "p-0 py-1 px-2"

const FileNodeTitle = ({ name }: { name: string }) => {
    return (
        <div className="truncate">
            {name}
        </div>
    )
}

const FileTreeNode = ({ name, directory, node, depth }: FileTreeNodeProps) => {
    const ide = useEditor()
    const { vfs } = useFileSystem()
    const logger = useLogger()
    const [isExpanded, setIsExpanded] = useState(false)
    const [newName, setName] = useState("")
    const [fullPath, setFullPath] = useState("")
    const [iconName, setIconName] = useState<any>("file")

    useEffect(() => {
        setName(name)
        setIconName(generateFileIconName(name))
    }, [])

    useEffect(() => {
        setFullPath(directory + "/" + name)
        setIconName(generateFileIconName(name))
        // setName(name)
    }, [path, name])

    const generateFileIconName = (filename: string) => {
        const { ext } = path.parse(filename)
        switch (ext) {
            case ".json":
                return "braces"
            case ".md":
                return "arrow-big-down"
            case ".toml":
                return "settings"
            case ".sol":
            case ".rs":
                return "file-box"
            default:
                return "file"
        }
    }

    if (isVFSFile(node)) {
        return <ContextMenu>
            <ContextMenuTrigger>
                <div onClick={() => ide.selectFile(node as VFSFile)}>
                    <div
                        className="group hover:bg-secondary flex items-center cursor-pointer space-x-1 pl-[16px]">
                        <FileIcon name={iconName} />
                        <FileNodeTitle name={name} />
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuSub>
                    <FileTreeContextMenuSubTrigger className={menuClass}>Rename</FileTreeContextMenuSubTrigger>
                    <ContextMenuSubContent className="flex items-center gap-2">
                        <Input className="h-8 border-none" onChange={(e) => setName(e.target.value)} value={newName} />
                        <Check size={16} className="hover:cursor-pointer hover:text-green-400" onClick={() => {
                            const isValid = /^[a-zA-Z0-9-_.]+$/.test(newName);
                            if (!isValid) {
                                logger.error("Invalid file name. Only alphanumeric characters, dashes, and underscores are allowed.")
                                return;
                            }

                            const { dir } = path.parse(fullPath)
                            const file = vfs.cat(fullPath)
                            // console.log(file.content)
                            vfs.touch(path.join(dir, newName), file.content)
                            vfs.rm(fullPath)

                            setName("")
                        }} />
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <FileTreeContextMenuItem className={menuClass} onClick={() => vfs.rm(fullPath)}>
                    Delete
                    <ContextMenuShortcut>
                        <Trash size={14} />
                    </ContextMenuShortcut>
                </FileTreeContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    }

    return <div className="pl-[8px]">
        <ContextMenu>
            <ContextMenuTrigger>
                <div onClick={() => node && setIsExpanded(!isExpanded)}
                    className="hover:bg-secondary flex items-center cursor-pointer space-x-1 pl-[4px]">
                    <div onClick={() => node && setIsExpanded(!isExpanded)}
                        className="hover:bg-secondary flex items-center cursor-pointer space-x-1 pl-[4px]">
                        <div className="flex items-center space-x-1">
                            <FileIcon name={isExpanded ? "folder-open" : "folder-closed"} />
                            <FileNodeTitle name={name} />
                        </div>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuSub>
                    <FileTreeContextMenuSubTrigger>Rename</FileTreeContextMenuSubTrigger>
                    <ContextMenuSubContent className="flex items-center gap-2">
                        <Input className="h-8 border-none" onChange={(e) => setName(e.target.value)} value={newName} />
                        <Check size={16} className="hover:cursor-pointer hover:text-green-400" onClick={() => {
                            const { dir } = path.parse(fullPath)
                            vfs.mv(fullPath, path.join(dir, newName))
                        }} />
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSub>
                    <FileTreeContextMenuSubTrigger>Add</FileTreeContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <FileTreeContextMenuItem onClick={() => {
                            vfs.touch(path.join(fullPath, "text.txt"), "")
                        }}>
                            File
                            <ContextMenuShortcut>
                                <FilePlus size={14} />
                            </ContextMenuShortcut>
                        </FileTreeContextMenuItem>
                        <FileTreeContextMenuItem onClick={() => vfs.mkdir(path.join(fullPath, "new-folder"))}>
                            Folder
                            <ContextMenuShortcut>
                                <FolderPlus size={14} />
                            </ContextMenuShortcut>
                        </FileTreeContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <FileTreeContextMenuItem onClick={() => vfs.rm(fullPath)}>
                    Delete
                    <ContextMenuShortcut>
                        <Trash size={14} />
                    </ContextMenuShortcut>
                </FileTreeContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>

        {isExpanded && node && (<ul style={{ listStyleType: "none" }}>
            {Object.entries(node).map(([childName, childNode]) => <li key={childName}>
                <FileTreeNode name={childName} node={childNode} depth={depth + 1} directory={fullPath} />
            </li>)}
        </ul>)}
    </div >
}

interface FileTreeProps extends React.HTMLAttributes<HTMLDivElement> {
    name?: string
}

export const FileTree = ({ className, name = "root" }: FileTreeProps) => {
    const { vfs, generateSources } = useFileSystem()
    const logger = useLogger()

    const handleDownload = async (event: any) => {
        try {
            const payload = await zipSources(await generateSources())
            logger.info(`Downloading contract... ${payload.size} bytes`)

            downloadBlob({
                source: payload,
                name: "contract.zip",
            })
        } catch (error) {
            logger.error("Failed to download contract.")
        }
    }

    if (!vfs.vfs) {
        return <div className={className}>Empty</div>
    }

    return (
        <div className={className}>
            <Title text="File Tree" />

            <div className="my-2 flex gap-2 pl-[4px]">
                <FileIcon name="file-plus" onClick={() => vfs.touch("text.txt")} />
                <FileIcon name="folder-plus" onClick={() => vfs.mkdir("folder")} />
                <FileIcon name="download" onClick={handleDownload} />
            </div>

            {/* <FileTreeNode name={name} node={vfs.vfs || {}} depth={0} path="" /> */}
            {Object.keys(vfs.vfs).map((name, index) => {
                return <FileTreeNode key={index} name={name} node={vfs.vfs[name] || {}} depth={0} directory="" />
            })}
        </div>
    )
}
