var options = {
  "TYPE": "MANGA",
  "MANGA": {
    "AlubmUrl": "http://www.manhua8.net/manhua/4250/",
    "Sites": {
      "www.xindm.cn": {
          // TODO AlbumLiLinkSelector 还是要优化，有的是a标签里的onclick事件上做跳转
          "AlbumNameSelector": ".fengmian_comic_head_con_r h1",
          "AlbumListSelector": "#mhlist ul",
          "AlbumLiLinkSelector": "a.new",
          // TODO 是不是需要添加一个Li的标题攫取？
          "MangaImgSelector": "#comicImg",
          "MangaTotalPageSelector": "#topSelect",
          // http://www.manhua8.net/manhua/4250/list_70203.htm => http://www.manhua8.net/manhua/4250/list_70203.htm?p=3
          "MangaNextPagePattern": /(\.htm)$/,
          "MangaNextPageReplace": function(pageNo) { return arguments[0] + '?p=' + pageNo; }
      },
      "www.manhua8.net": {
          "AlbumNameSelector": ".bookInfo h1 b",
          "AlbumListSelector": ".bookList ul",
          "AlbumLiLinkSelector": "a.new",
          "MangaImgSelector": "#comicImg",
          "MangaTotalPageSelector": "#topSelect",
          // http://www.manhua8.net/manhua/4250/list_70203.htm => http://www.manhua8.net/manhua/4250/list_70203.htm?p=3
          "MangaNextPagePattern": /(\.htm)$/,
          "MangaNextPageReplace": function(pageNo) { return arguments[0] + '?p=' + pageNo; }
      },
      "www.seemh.com": {
          "AlbumNameSelector": ".book-title h1",
          "AlbumListSelector": ".chapter-list-0 ul",
          "AlbumLiLinkSelector": "a",
          "MangaImgSelector": "#mangaFile",
          "MangaTotalPageSelector": "#pageSelect",
          // http://www.seemh.com/comic/6664/57813.html => http://www.seemh.com/comic/6664/57813_p2.html
          "MangaNextPagePattern": /(\.html)$/,
          "MangaNextPageReplace": function(pageNo) { return '_p' + pageNo + arguments[0]; }
      }
    }
  },
  "VIDEO": {},
  "LIST": {},
  "STRING": {}
};

module.exports = options;