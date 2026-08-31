import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Bookmark,
  Plus,
  X,
  Lock,
  ExternalLink,
  Search,
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  Clock,
  Compass,
  ArrowUpRight,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isSearch: boolean;
  searchQuery?: string;
  history: { url: string; isSearch: boolean; searchQuery?: string; title: string }[];
  historyIndex: number;
}

interface WebBrowserProps {
  initialUrl?: string;
}

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
  pageId?: number;
}

const DEFAULT_BOOKMARKS = [
  { name: 'SimpleSearch', url: 'home', isSearch: true },
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
  { name: 'Excalidraw', url: 'https://excalidraw.com' },
  { name: 'CodePen', url: 'https://codepen.io/pen/' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com' },
  { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.5%2C-0.1%2C51.53&layer=mapnik' },
];

const POPULAR_TOPICS = [
  'Artificial Intelligence',
  'Web Development',
  'Solar System',
  'Quantum Computing',
  'Open Source Software',
  'Linux Operating System',
  'Philosophy of Mind',
];

export const WebBrowser: React.FC<WebBrowserProps> = ({ initialUrl }) => {
  const isInitialSearch = !initialUrl || initialUrl === 'home' || initialUrl.startsWith('search:');
  const initialQuery = initialUrl?.startsWith('search:') ? initialUrl.replace('search:', '') : '';

  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: isInitialSearch ? (initialQuery ? `Search: ${initialQuery}` : 'Simple Search') : 'Wikipedia',
      url: initialUrl || 'home',
      isSearch: isInitialSearch,
      searchQuery: initialQuery,
      history: [
        {
          url: initialUrl || 'home',
          isSearch: isInitialSearch,
          searchQuery: initialQuery,
          title: isInitialSearch ? (initialQuery ? `Search: ${initialQuery}` : 'Simple Search') : 'Wikipedia',
        },
      ],
      historyIndex: 0,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [urlInput, setUrlInput] = useState<string>(initialQuery || (initialUrl && initialUrl !== 'home' ? initialUrl : ''));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [instantAnswer, setInstantAnswer] = useState<{ title: string; extract: string; url?: string } | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Perform live search when search query changes
  useEffect(() => {
    if (activeTab.isSearch && activeTab.searchQuery) {
      executeSearch(activeTab.searchQuery);
    } else if (activeTab.isSearch && !activeTab.searchQuery) {
      setSearchResults([]);
      setInstantAnswer(null);
    }
  }, [activeTab.isSearch, activeTab.searchQuery]);

  const executeSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setInstantAnswer(null);
      return;
    }

    setIsSearching(true);
    try {
      // 1. Fetch from Wikipedia Open Search API
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        trimmed
      )}&utf8=&format=json&origin=*&srlimit=8`;

      const res = await fetch(wikiUrl);
      const data = await res.json();

      let results: SearchResult[] = [];

      if (data?.query?.search && data.query.search.length > 0) {
        results = data.query.search.map((item: any) => ({
          title: item.title,
          snippet: item.snippet.replace(/<\/?[^>]+(>|$)/g, ''), // Strip HTML tags
          url: `https://en.m.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
          source: 'Wikipedia Encyclopedia',
          pageId: item.pageid,
        }));

        // Fetch quick summary for top result
        try {
          const topTitle = data.query.search[0].title;
          const summaryRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle.replace(/ /g, '_'))}`
          );
          const summaryData = await summaryRes.json();
          if (summaryData && summaryData.extract) {
            setInstantAnswer({
              title: summaryData.title,
              extract: summaryData.extract,
              url: summaryData.content_urls?.desktop?.page || summaryData.content_urls?.mobile?.page,
            });
          } else {
            setInstantAnswer(null);
          }
        } catch {
          setInstantAnswer(null);
        }
      } else {
        // Fallback simulated intelligent results
        results = [
          {
            title: `Search results for "${trimmed}"`,
            snippet: `Explore encyclopedic knowledge, related articles, and web resources regarding ${trimmed}.`,
            url: `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`,
            source: 'Web Search',
          },
          {
            title: `${trimmed} - Wikipedia Overview`,
            snippet: `Read articles, historical background, definitions, and references for ${trimmed} on Wikipedia.`,
            url: `https://en.m.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(trimmed)}`,
            source: 'Wikipedia',
          },
        ];
        setInstantAnswer({
          title: trimmed,
          extract: `Information and web indexes related to "${trimmed}". You can click any search card below to load the live article or open the search result in an external browser tab.`,
        });
      }

      setSearchResults(results);
    } catch (err) {
      // Offline fallback
      setSearchResults([
        {
          title: `Web result for: ${trimmed}`,
          snippet: `Search queries and topics matching "${trimmed}". Click to load in external tab or view reference details.`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`,
          source: 'Web Index',
        },
      ]);
      setInstantAnswer({
        title: trimmed,
        extract: `Search results for "${trimmed}".`,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleNavigate = (rawInput: string) => {
    let clean = rawInput.trim();
    if (!clean) return;

    const isHttpUrl = clean.startsWith('http://') || clean.startsWith('https://');
    const isDomain = clean.includes('.') && !clean.includes(' ') && !clean.startsWith('http');

    if (clean === 'home') {
      // Home page
      updateCurrentTab('home', true, '', 'Simple Search');
      setUrlInput('');
      return;
    }

    if (isHttpUrl || isDomain) {
      const targetUrl = isDomain ? `https://${clean}` : clean;
      const domainName = targetUrl.replace('https://', '').replace('http://', '').split('/')[0];
      updateCurrentTab(targetUrl, false, undefined, domainName);
      setUrlInput(targetUrl);
    } else {
      // Search query
      updateCurrentTab(`search:${clean}`, true, clean, `Search: ${clean}`);
      setUrlInput(clean);
    }
  };

  const updateCurrentTab = (url: string, isSearch: boolean, searchQuery?: string, title?: string) => {
    setIsLoading(true);
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId) return t;
        const nextHistory = t.history.slice(0, t.historyIndex + 1);
        const tabTitle = title || (isSearch ? `Search: ${searchQuery}` : url.replace('https://', '').split('/')[0]);
        nextHistory.push({ url, isSearch, searchQuery, title: tabTitle });
        return {
          ...t,
          url,
          isSearch,
          searchQuery,
          title: tabTitle,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
        };
      })
    );
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      const prevIndex = activeTab.historyIndex - 1;
      const prev = activeTab.history[prevIndex];
      setUrlInput(prev.searchQuery || (prev.url !== 'home' ? prev.url : ''));
      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                historyIndex: prevIndex,
                url: prev.url,
                isSearch: prev.isSearch,
                searchQuery: prev.searchQuery,
                title: prev.title,
              }
            : t
        )
      );
    }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const nextIndex = activeTab.historyIndex + 1;
      const next = activeTab.history[nextIndex];
      setUrlInput(next.searchQuery || (next.url !== 'home' ? next.url : ''));
      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                historyIndex: nextIndex,
                url: next.url,
                isSearch: next.isSearch,
                searchQuery: next.searchQuery,
                title: next.title,
              }
            : t
        )
      );
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (activeTab.isSearch && activeTab.searchQuery) {
      executeSearch(activeTab.searchQuery);
    }
    setTimeout(() => setIsLoading(false), 400);
  };

  const addTab = () => {
    const newId = 'tab_' + Date.now();
    const newTab: BrowserTab = {
      id: newId,
      title: 'Simple Search',
      url: 'home',
      isSearch: true,
      searchQuery: '',
      history: [{ url: 'home', isSearch: true, searchQuery: '', title: 'Simple Search' }],
      historyIndex: 0,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setUrlInput('');
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[0].id);
      setUrlInput(nextTabs[0].searchQuery || (nextTabs[0].url !== 'home' ? nextTabs[0].url : ''));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] text-stone-200 select-none overflow-hidden font-sans">
      {/* Browser Tab Bar */}
      <div className="h-9 px-2 bg-black/80 border-b border-white/10 flex items-center gap-1 shrink-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setUrlInput(tab.searchQuery || (tab.url !== 'home' ? tab.url : ''));
              }}
              className={`group max-w-[200px] h-7 px-3 rounded-t-lg flex items-center justify-between gap-2 text-xs cursor-pointer border-t border-x transition-colors ${
                isActive
                  ? 'bg-[#121214] border-white/20 text-stone-100 shadow'
                  : 'bg-black/40 border-transparent text-stone-400 hover:bg-white/5 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {tab.isSearch ? (
                  <Search className="w-3 h-3 text-stone-400 shrink-0" />
                ) : (
                  <Globe className="w-3 h-3 text-stone-300 shrink-0" />
                )}
                <span className="truncate">{tab.title || 'New Tab'}</span>
              </div>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-stone-400 hover:text-white transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={addTab}
          className="p-1 rounded-md hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          title="New Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation URL Toolbar */}
      <div className="h-11 px-3 bg-[#0d0d0f] border-b border-white/10 flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={activeTab.historyIndex === 0}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={activeTab.historyIndex >= activeTab.history.length - 1}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors ${
              isLoading || isSearching ? 'animate-spin' : ''
            }`}
            title="Reload"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNavigate('home')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            title="Search Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox Address & Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate(urlInput);
          }}
          className="flex-1 flex items-center h-8 px-3 rounded-lg bg-black/60 border border-white/15 focus-within:border-stone-400 focus-within:ring-1 focus-within:ring-white/20 transition-all"
        >
          {activeTab.isSearch ? (
            <Search className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
          )}
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Type any search query (e.g. 'hi', 'react') or enter web URL..."
            className="w-full bg-transparent text-xs text-white placeholder:text-stone-500 focus:outline-none font-sans select-text"
          />
          {urlInput && (
            <button
              type="button"
              onClick={() => setUrlInput('')}
              className="text-stone-500 hover:text-stone-300 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-1 text-stone-400">
          {!activeTab.isSearch && activeTab.url && activeTab.url !== 'home' && (
            <button
              onClick={() => window.open(activeTab.url, '_blank')}
              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              title="Open website in new external browser tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="h-7 px-3 bg-black/40 border-b border-white/5 flex items-center gap-2 text-[11px] text-stone-400 shrink-0 overflow-x-auto">
        <Bookmark className="w-3 h-3 text-stone-400 shrink-0 mr-1" />
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => handleNavigate(bm.url)}
            className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors truncate max-w-[140px]"
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Main Browser Stage: Search Engine OR Web Iframe */}
      <div className="flex-1 relative overflow-y-auto bg-[#0a0a0c]">
        {activeTab.isSearch ? (
          /* Live Search Engine View */
          <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
            {/* Search Header */}
            {!activeTab.searchQuery ? (
              /* Home Splash */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-stone-200 text-black flex items-center justify-center font-bold text-2xl mb-4 shadow-xl">
                  S
                </div>
                <h1 className="text-2xl font-bold text-stone-100 mb-2">SimpleOS Search</h1>
                <p className="text-xs text-stone-400 max-w-md mb-8">
                  Fast, privacy-focused search engine connecting to live encyclopedia knowledge, web references, and tools.
                </p>

                {/* Big Search Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (urlInput.trim()) handleNavigate(urlInput);
                  }}
                  className="w-full max-w-lg flex items-center h-12 px-4 rounded-2xl bg-[#141416] border border-white/15 focus-within:border-stone-300 shadow-2xl transition-all mb-8"
                >
                  <Search className="w-5 h-5 text-stone-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Search anything (e.g. 'hi', 'photosynthesis', 'react js')..."
                    className="w-full bg-transparent text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-stone-200 text-black text-xs font-semibold hover:bg-white transition-colors ml-2"
                  >
                    Search
                  </button>
                </form>

                {/* Popular Topics */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-stone-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Explore Trending Topics
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                    {POPULAR_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleNavigate(topic)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-stone-300 hover:text-white transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Search Results Page */
              <div className="flex flex-col gap-6">
                {/* Search query banner */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="text-xs text-stone-400 font-mono">SEARCH RESULTS FOR</div>
                    <div className="text-xl font-bold text-stone-100">{activeTab.searchQuery}</div>
                  </div>
                  <div className="text-xs text-stone-500 font-mono">
                    {isSearching ? 'Searching...' : `${searchResults.length} results found`}
                  </div>
                </div>

                {/* Instant Answer / Definition Card */}
                {instantAnswer && (
                  <div className="p-5 rounded-2xl bg-[#141417] border border-white/15 shadow-xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>QUICK KNOWLEDGE SUMMARY</span>
                    </div>
                    <h2 className="text-base font-bold text-stone-100">{instantAnswer.title}</h2>
                    <p className="text-xs text-stone-300 leading-relaxed">{instantAnswer.extract}</p>
                    {instantAnswer.url && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleNavigate(instantAnswer.url!)}
                          className="text-xs text-stone-300 hover:text-white underline decoration-stone-500 flex items-center gap-1"
                        >
                          Read full article <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Results List */}
                <div className="flex flex-col gap-4">
                  {searchResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="group p-4 rounded-xl bg-[#111113] hover:bg-[#161619] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                        <span>{res.source}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => window.open(res.url, '_blank')}
                            className="hover:text-white flex items-center gap-1"
                            title="Open in new external browser tab"
                          >
                            New Tab <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleNavigate(res.url)}
                        className="text-left font-bold text-sm text-stone-100 group-hover:text-white hover:underline transition-colors"
                      >
                        {res.title}
                      </button>

                      <p className="text-xs text-stone-400 leading-relaxed">{res.snippet}</p>

                      <div className="pt-1 flex items-center gap-3">
                        <button
                          onClick={() => handleNavigate(res.url)}
                          className="text-[11px] font-semibold text-stone-300 hover:text-white flex items-center gap-1"
                        >
                          Open in Browser <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {searchResults.length === 0 && !isSearching && (
                    <div className="p-8 text-center text-xs text-stone-400 bg-white/5 rounded-2xl border border-white/10">
                      No matching search results found. Try searching for broader terms like "computer", "science", or "history".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Web Page / Iframe View */
          <div className="w-full h-full relative flex flex-col">
            <iframe
              src={activeTab.url}
              className="w-full h-full border-none flex-1"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              title={activeTab.title}
            />
          </div>
        )}
      </div>
    </div>
  );
};
