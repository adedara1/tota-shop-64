import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextStyle from '@tiptap/extension-text-style'
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  Image as ImageIcon, Table as TableIcon, Quote, Code,
  MoreVertical, Heading1, Heading2, Heading3
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/integrations/supabase/client"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileName = `${crypto.randomUUID()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(fileName)

      editor.chain().focus().setImage({ src: publicUrl }).run()
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      if (e.target instanceof HTMLInputElement) {
        handleImageUpload(e as React.ChangeEvent<HTMLInputElement>)
      }
    }
    input.click()
  }

  const addLink = () => {
    const url = window.prompt('URL du lien')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  // ... keep existing code (JSX for the editor toolbar buttons)

  return (
    <div className="border rounded-md">
      <div className="border-b p-2 flex flex-wrap gap-2 bg-white">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded hover:bg-gray-100"
              type="button"
              title="Styles de titre"
            >
              <Heading1 className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="w-4 h-4 mr-2" /> Titre 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="w-4 h-4 mr-2" /> Titre 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="w-4 h-4 mr-2" /> Titre 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded hover:bg-gray-100"
              type="button"
              title="Taille de police"
            >
              <span className="font-bold">T</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().setStyle({ fontSize: '12px' }).run()}>
              Petit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setStyle({ fontSize: '16px' }).run()}>
              Normal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setStyle({ fontSize: '20px' }).run()}>
              Grand
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setStyle({ fontSize: '24px' }).run()}>
              Très grand
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('underline') ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Souligné"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Aligner à gauche"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Centrer"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Aligner à droite"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('link') ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Ajouter un lien"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('blockquote') ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Citation"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('codeBlock') ? 'bg-gray-100' : ''
          }`}
          type="button"
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
          title="Ajouter une image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={addTable}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
          title="Ajouter un tableau"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded hover:bg-gray-100"
              type="button"
              title="Plus d'options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().clearNodes().run()}>
              Effacer le formatage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().undo().run()}>
              Annuler
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().redo().run()}>
              Rétablir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[200px] prose max-w-none"
      />
    </div>
  )
}

export default RichTextEditor
