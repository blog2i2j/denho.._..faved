import React, { useState } from 'react';
import { Bookmark, Copy, Feather, GitCompare, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile.ts';

export const SettingsBookmarklet = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [copied, setCopied] = useState(false);
  const bookmarkletRef = React.useRef(null);
  const isMobile = useIsMobile();

  const bookmarkletFunction = () => {
    const urlParams = new URLSearchParams();
    urlParams.append('url', window.location.href);
    urlParams.append('title', document.title);
    const meta_description = document.querySelector('meta[name="description"]');
    if (meta_description) {
      urlParams.append('description', meta_description.getAttribute('content') || '');
    }

    const imageUrl =
      document.querySelector('meta[property="og:image"]')?.getAttribute('content') ??
      document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ??
      Array.from(document.querySelectorAll('img'))
        .find((img) => img.naturalWidth >= 200 && img.naturalHeight >= 200)
        ?.getAttribute('src');

    if (imageUrl) {
      const resolveUrl = (url) => {
        if (url.startsWith('http')) {
          return url;
        }

        // Handle protocol-relative URLs
        if (url.startsWith('//')) {
          return (window.location.protocol || 'https') + url;
        }

        // Handle absolute paths
        if (url.startsWith('/')) {
          return window.location.origin + url;
        }

        // Handle relative paths
        let path = window.location.pathname || '/';
        path = path.substring(0, path.lastIndexOf('/'));

        return window.location.origin + path + '/' + url;
      };

      urlParams.append('image', resolveUrl(imageUrl));
    }

    const windowWidth = 700;
    const windowHeight = 800;
    const leftPos = Math.floor((screen.width - windowWidth) / 2);
    const topPos = Math.floor((screen.height - windowHeight) / 2);
    const windowProps = {
      width: windowWidth,
      height: windowHeight,
      left: leftPos,
      top: topPos,
      noopener: 0,
      noreferrer: 0,
      popup: 1,
    };

    window.open(
      `<<BASE_PATH>>?${urlParams.toString()}`,
      '_blank',
      Object.entries(windowProps)
        .map(([key, value]) => key + '=' + value.toString())
        .join(',')
    );
  };

  const generateBookmarkletCode = () => {
    const basePath = window.location.origin + '/create-item';
    return `javascript:(${bookmarkletFunction.toString()})();`.replace('<<BASE_PATH>>', basePath);
  };

  const copyBookmarkletCode = async () => {
    const code = generateBookmarkletCode();

    if (onSuccess) {
      onSuccess();
    }

    if (isMobile) {
      window.prompt('Copy the bookmarklet code:', code);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    const bookmarkletElement = bookmarkletRef.current;
    if (bookmarkletElement) {
      bookmarkletElement.setAttribute('href', generateBookmarkletCode());
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What is a Bookmarklet?</CardTitle>
          <CardDescription>
            <p>
              A bookmarklet is a bookmark stored in a web browser that contains JavaScript commands. Unlike browser
              extensions, they are lightweight and only access the page when you click them.
            </p>
            <p className="mt-2">
              Faved bookmarklet allows you to quickly save any webpage to your Faved collection with a single click.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-around">
            <Card className="border-none text-center shadow-none">
              <CardContent className="p-0">
                <GitCompare className="text-primary mx-auto mb-3 h-8 w-8" />
                <h4 className="text-primary mb-2 font-semibold">Compatible</h4>
                <p className="text-muted-foreground mx-auto max-w-[180px] text-sm">
                  Works in all modern desktop and mobile browsers
                </p>
              </CardContent>
            </Card>

            <Card className="border-none text-center shadow-none">
              <CardContent className="p-0">
                <Shield className="text-primary mx-auto mb-3 h-8 w-8" />
                <h4 className="text-primary mb-2 font-semibold">Secure</h4>
                <p className="text-muted-foreground mx-auto max-w-[180px] text-sm">
                  No access to your page data until activated
                </p>
              </CardContent>
            </Card>

            <Card className="border-none text-center shadow-none">
              <CardContent className="p-0">
                <Feather className="text-primary mx-auto mb-3 h-8 w-8" />
                <h4 className="text-primary mb-2 font-semibold">Lightweight</h4>
                <p className="text-muted-foreground mx-auto max-w-[180px] text-sm">No browser extension is needed</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Installation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <a
              className="bg-background/20 hover:bg-background/30 flex w-full cursor-move items-center justify-center gap-2 rounded-md border-1 border-2 border-dashed px-3 py-1 sm:w-auto"
              href="#"
              ref={bookmarkletRef}
              draggable="true"
              onDragEnd={() => {
                if (onSuccess) onSuccess();
              }}
            >
              <Bookmark className="h-4 w-4" />
              Add to Faved
            </a>
            <Button onClick={copyBookmarkletCode} className="w-full gap-2 sm:w-auto">
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
          <Tabs defaultValue="drag" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="drag">Drag</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
            <TabsContent value="drag" className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-background text-primary">
                    1
                  </Badge>
                  <span>Drag "Add to Faved" button to your browser's bookmarks bar.</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="manual" className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-background text-primary">
                    1
                  </Badge>
                  <span>Click "Copy Code" button above.</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-background text-primary">
                    2
                  </Badge>
                  <span>Add a new bookmark in your browser.</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-background text-primary">
                    3
                  </Badge>
                  <span>Paste the copied code in the "URL" field.</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-background text-primary">
                    4
                  </Badge>
                  <span>Specify a name for the bookmark, for example "Add to Faved".</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-background text-primary">
                    5
                  </Badge>
                  <span>Save the bookmark.</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-background text-primary">
                1
              </Badge>
              <span>Click the "Add to Faved" bookmarklet on any page you’d like to save.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-background text-primary">
                2
              </Badge>
              <span>A window will appear, allowing you to add the page to your bookmarks.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-background text-primary">
                3
              </Badge>
              <span>Optionally, add notes and tags, then click Save.</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-background text-primary">
                4
              </Badge>
              <span>The page will be stored and available in Faved.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
