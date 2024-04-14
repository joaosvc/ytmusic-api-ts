import { AlbumBasic, ArtistBasic, SongDetailed, SongFull, ThumbnailFull } from "../@types/types"
import checkType from "../utils/checkType"
import { isAlbum, isArtist, isDuration, isTitle } from "../utils/filters"
import { traverseList, traverseString } from "../utils/traverse"
import Parser from "./Parser"

export default class SongParser {
	public static parse(data: any): SongFull {
		return checkType(
			{
				type: "SONG",
				videoId: traverseString(data, "videoDetails", "videoId"),
				name: traverseString(data, "videoDetails", "title"),
				/**
				 * What could this Parse be? How do we get into it?
				 * Then we define the main artist in the list
				 */
				artists: [
					{
						name: traverseString(data, "author"),
						artistId: traverseString(data, "videoDetails", "channelId"),
					},
				],
				artist: {
					name: traverseString(data, "author"),
					artistId: traverseString(data, "videoDetails", "channelId"),
				},
				duration: +traverseString(data, "videoDetails", "lengthSeconds"),
				thumbnails: traverseList(data, "videoDetails", "thumbnails"),
				formats: traverseList(data, "streamingData", "formats"),
				adaptiveFormats: traverseList(data, "streamingData", "adaptiveFormats"),
			},
			SongFull,
		)
	}

	public static parseSearchResult(item: any): SongDetailed {
		const columns = traverseList(item, "flexColumns", "runs")
		const menu = traverseList(item, "menu", "items")

		// It is not possible to identify the title and author
		const title = columns[0]
		const artist = columns[1]
		const artists = columns.filter(isArtist)
		const album = columns.find(isAlbum) ?? null
		const duration = columns.find(isDuration)

		return checkType(
			{
				type: "SONG",
				videoId: traverseString(item, "playlistItemData", "videoId"),
				playlistId: traverseString(menu, "navigationEndpoint", "playlistId"),
				params: traverseString(menu, "navigationEndpoint", "params"),
				name: traverseString(title, "text"),
				artists: artists.map(artist => {
					return {
						name: traverseString(artist, "text"),
						artistId: traverseString(artist, "browseId") || null,
					}
				}),
				artist: {
					name: traverseString(artist, "text"),
					artistId: traverseString(artist, "browseId") || null,
				},
				album: album && {
					name: traverseString(album, "text"),
					albumId: traverseString(album, "browseId"),
				},
				duration: Parser.parseDuration(duration?.text),
				thumbnails: traverseList(item, "thumbnails"),
			},
			SongDetailed,
		)
	}

	public static parseArtistSong(item: any, artistBasic: ArtistBasic): SongDetailed {
		const columns = traverseList(item, "flexColumns", "runs").flat()
		const menu = traverseList(item, "menu", "items")

		const title = columns.find(isTitle)
		const artists = columns.filter(isArtist)
		const album = columns.find(isAlbum)
		const duration = columns.find(isDuration)

		return checkType(
			{
				type: "SONG",
				videoId: traverseString(item, "playlistItemData", "videoId"),
				playlistId: traverseString(menu, "navigationEndpoint", "playlistId"),
				params: traverseString(menu, "navigationEndpoint", "params"),
				name: traverseString(title, "text"),
				artists: artists.map(artist => {
					return {
						name: traverseString(artist, "text"),
						artistId: traverseString(artist, "browseId") || null,
					}
				}),
				artist: artistBasic,
				album: {
					name: traverseString(album, "text"),
					albumId: traverseString(album, "browseId"),
				},
				duration: duration ? Parser.parseDuration(duration.text) : null,
				thumbnails: traverseList(item, "thumbnails"),
			},
			SongDetailed,
		)
	}

	public static parseArtistTopSong(item: any, artistBasic: ArtistBasic): SongDetailed {
		const columns = traverseList(item, "flexColumns", "runs").flat()
		const menu = traverseList(item, "menu", "items")

		const title = columns.find(isTitle)
		const artists = columns.filter(isArtist)
		const album = columns.find(isAlbum)

		return checkType(
			{
				type: "SONG",
				videoId: traverseString(item, "playlistItemData", "videoId"),
				playlistId: traverseString(menu, "navigationEndpoint", "playlistId"),
				params: traverseString(menu, "navigationEndpoint", "params"),
				name: traverseString(title, "text"),
				artists: artists.map(artist => {
					return {
						name: traverseString(artist, "text"),
						artistId: traverseString(artist, "browseId") || null,
					}
				}),
				artist: artistBasic,
				album: {
					name: traverseString(album, "text"),
					albumId: traverseString(album, "browseId"),
				},
				duration: null,
				thumbnails: traverseList(item, "thumbnails"),
			},
			SongDetailed,
		)
	}

	public static parseAlbumSong(
		item: any,
		artistBasic: ArtistBasic,
		albumBasic: AlbumBasic,
		thumbnails: ThumbnailFull[],
	): SongDetailed {
		const columns = traverseList(item, "flexColumns", "runs").flat()
		const menu = traverseList(item, "menu", "items")

		const title = columns.find(isTitle)
		const artists = columns.filter(isArtist)
		const duration = columns.find(isDuration)

		return checkType(
			{
				type: "SONG",
				videoId: traverseString(item, "playlistItemData", "videoId"),
				playlistId: traverseString(menu, "navigationEndpoint", "playlistId"),
				params: traverseString(menu, "navigationEndpoint", "params"),
				name: traverseString(title, "text"),
				artists: artists.map(artist => {
					return {
						name: traverseString(artist, "text"),
						artistId: traverseString(artist, "browseId") || null,
					}
				}),
				artist: artistBasic,
				album: albumBasic,
				duration: duration ? Parser.parseDuration(duration.text) : null,
				thumbnails,
			},
			SongDetailed,
		)
	}
}
