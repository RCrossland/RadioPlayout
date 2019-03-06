using RadioPlayout.Models;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RadioPlayout.Controllers
{
    public class RadioPlayerController : Controller
    {
		RadioPlayoutDb _db = new RadioPlayoutDb();

        // GET: RadioPlayer
        public ActionResult Index()
        {
			dynamic model = new ExpandoObject();

			model.ScheduleItems = from scheduleItem in _db.ScheduleItems
								  where scheduleItem.Schedule.ScheduleId == 1
								  select scheduleItem;

			model.Audio = _db.Audio.ToList();

			return View(model);
        }
		
		/// <summary>
		/// Get the ScheduleItems from the ScheduleItems database
		/// </summary>
		/// <param name="scheduleId">The ScheduleId to search for</param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult GetScheduleItemsData(string scheduleId)
		{
			int scheduleItemsIdInt = 0;
			if (!String.IsNullOrWhiteSpace(scheduleId))
			{
				scheduleItemsIdInt = Int32.Parse(scheduleId);
			}

			var scheduleItems = _db.ScheduleItems
								.Where(r => scheduleItemsIdInt == 0 || r.Schedule.ScheduleId.Equals(scheduleItemsIdInt))
								.OrderBy(r => r.OrderIndex);

			return Json(scheduleItems, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// Update the OrderIndex of an item in the ScheduleItems database
		/// </summary>
		/// <param name="scheduleId">The schedule the ScheduleItem corresponds to</param>
		/// <param name="scheduleItemId">The ScheduleItem that needs a new OrderIndex</param>
		/// <param name="newItemOrderIndex">The new OrderIndex for the ScheduleItem</param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult UpdateScheduleItemOrderIndex(string scheduleId, string scheduleItemId, string newItemOrderIndex)
		{
			// If scheduleId has a value convert it to an integer
			int scheduleIdInt = 0;
			if (!String.IsNullOrWhiteSpace(scheduleId))
			{
				scheduleIdInt = Int32.Parse(scheduleId);
			}
			// If scheduleItemId has a value convert it to an integer
			int scheduleItemIdInt = 0;
			if (!String.IsNullOrWhiteSpace(scheduleItemId))
			{
				scheduleItemIdInt = Int32.Parse(scheduleItemId);
			}
			// If newItemOrderIndex has a value convert it to an integer
			int newItemOrderIndexInt = 0;
			if (!String.IsNullOrWhiteSpace(newItemOrderIndex))
			{
				newItemOrderIndexInt = Int32.Parse(newItemOrderIndex);
			}

			// Ensure both the scheduleId, scheduleItemId and newItemOrderID have been converted to integers
			if (scheduleIdInt > 0 && scheduleItemIdInt > 0 && newItemOrderIndexInt > 0)
			{
				// Change the current scheduleItemId's OrderIndex to 0
				// Select the current scheduleItem
				var currentScheduleItem = _db.ScheduleItems
										.Where(r => r.Schedule.ScheduleId.Equals(scheduleIdInt))
										.Where(r => r.ScheduleItemsId.Equals(scheduleItemIdInt));
				// Placeholder for the current scheduleItems OrderIndex
				int currentIndex = 0;
				foreach(ScheduleItems scheduleItem in currentScheduleItem)
				{
					currentIndex = scheduleItem.OrderIndex;
					scheduleItem.OrderIndex = 0;
				}
				_db.SaveChanges();

				// Change the remaining ScheduleItems OrderIndex up by one
				// Select all scheduleItems that are higher ranked than the new position
				var query = _db.ScheduleItems
						.Where(r => r.Schedule.ScheduleId.Equals(scheduleIdInt))
						.Where(r => r.OrderIndex > newItemOrderIndexInt);

				// If there were any scheduleItems higher than the current
				if (query.Any())
				{
					// Select the scheduleItems that are equal to order than the new OrderIndex
					query = _db.ScheduleItems
						.Where(r => r.Schedule.ScheduleId.Equals(scheduleIdInt))
						.Where(r => r.OrderIndex >= newItemOrderIndexInt);

					// Set the reference for the currentOrderIndex to be the scheduleItem above the new index
					int currentOrderIndex = newItemOrderIndexInt + 1;
					foreach (ScheduleItems scheduleItem in query)
					{
						// Move each scheduleItems one place higher
						scheduleItem.OrderIndex = currentOrderIndex;
						currentOrderIndex += 1;
					}
				}
				else
				{
					// If there are no scheduleItems above the new OrderIndex
					// This scheduleItem is at the highest point

					// Select the scheduleItems that are greater than the current scheduleItems index 
					query = _db.ScheduleItems
						.Where(r => r.Schedule.ScheduleId.Equals(scheduleIdInt))
						.Where(r => r.OrderIndex > currentIndex)
						.OrderByDescending(r => r.OrderIndex);

					int currentOrderIndex = newItemOrderIndexInt - 1;
					foreach (ScheduleItems scheduleItem in query)
					{
						// Move the scheduleItems between the current OrderIndex and the new OrderIndex down one
						scheduleItem.OrderIndex = currentOrderIndex;
						currentOrderIndex -= 1;
					}
				}
				_db.SaveChanges();

				// Change the OrderIndex of the selected scheduleItem to be the new OrderIndex. This should fill the gap between the scheduleItems that have been moved
				var newScheduleItem = _db.ScheduleItems
										.Where(r => r.Schedule.ScheduleId.Equals(scheduleIdInt))
										.Where(r => r.ScheduleItemsId.Equals(scheduleItemIdInt));

				foreach (ScheduleItems scheduleItem in newScheduleItem)
				{
					scheduleItem.OrderIndex = newItemOrderIndexInt;
				}

				_db.SaveChanges();

				// Return nothing to JSON
				return Json("", JsonRequestBehavior.AllowGet);
			}
			else
			{
				//  TODO: Submit an error message
			}
			
			// Return nothing to the json call. This should essentially never be submitted.
			return Json("", JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// To add a new item to the ScheduleItems database
		/// </summary>
		/// <param name="scheduleId">The scheduleId that the schedule item corresponds to</param>
		/// <param name="audioId">The audioId that the scheudle item corresponds to</param>
		/// <param name="orderIndex">The order index that the new schedule item should have</param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult AddNewScheduleItem(string scheduleId, string audioId, string orderIndex)
		{
			int scheduleIdInt = 0;
			// Convert the scheduleId to an integer
			if (!String.IsNullOrWhiteSpace(scheduleId))
			{
				scheduleIdInt = Int32.Parse(scheduleId);
			}

			int audioIdInt = 0;
			// Convert the audioId to an integer
			if (!String.IsNullOrWhiteSpace(audioId))
			{
				audioIdInt = Int32.Parse(audioId);
			}

			int orderIndexInt = 0;
			// Convert the orderIndex to an integer
			if (!string.IsNullOrWhiteSpace(orderIndex))
			{
				orderIndexInt = Int32.Parse(orderIndex);
			}

			// First move the scheduleItem orderIndexs to make room for the new scheduleItem
			// Select the items that are above the new scheduleItem
			var existingScheduleItems = _db.ScheduleItems.Where(r => r.OrderIndex > orderIndexInt);

			if (existingScheduleItems.Any())
			{
				// There are schedule items above this one
				existingScheduleItems = _db.ScheduleItems.Where(r => r.OrderIndex >= orderIndexInt);

				int currentOrderIndex = orderIndexInt + 1;
				foreach (ScheduleItems existingScheduleItem in existingScheduleItems)
				{
					// Move the scheduleItems between the current OrderIndex and the new OrderIndex down one
					existingScheduleItem.OrderIndex = currentOrderIndex;
					currentOrderIndex += 1;
				}
			}

			// Find references to the schedule and audio models in order to be used as primary keys
			Schedule schedule = _db.Schedule.Where(r => r.ScheduleId.Equals(scheduleIdInt)).First();
			Audio audio = _db.Audio.Where(r => r.AudioId.Equals(audioIdInt)).First();

			// Create a new scheduleItem object
			ScheduleItems scheduleItem = new ScheduleItems
			{
				OrderIndex = orderIndexInt,
				Schedule = schedule,
				Audio = audio
			};
			// Add the new scheduleItem object to the database and save the changes
			_db.ScheduleItems.Add(scheduleItem);
			_db.SaveChanges();

			return Json("", JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// Filter the Audio database based on inputs from the user
		/// </summary>
		/// <param name="audioSearch">An artist name to search for. E.g. "Olly Murs"</param>
		/// <param name="audioType">An audio type to search for. E.g "Jingle"</param>
		/// <param name="audioMinDuration">The minimum seconds of a song duration to search for. E.g. "100"</param>
		/// <param name="audioMaxDuration">The maximum seconds of a song duration to search for. E.g. "500"</param>
		/// <param name="audioYear">The audio year to search for. E.g. "90s"</param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult FilterAudioCatalogue(string audioSearch, string audioType, string audioMinDuration, string audioMaxDuration, string audioYear)
		{
			// Check audioType has a value and convert it to an integer
			int audioTypeInt = 0;
			if (!String.IsNullOrWhiteSpace(audioType))
			{
				audioTypeInt = Int32.Parse(audioType);
			}
			// Check audioMinDuration has a value and convert it to an integer
			int audioMinDurationInt = 0;
			if (!String.IsNullOrWhiteSpace(audioMinDuration))
			{
				audioMinDurationInt = Int32.Parse(audioMinDuration);
			}
			// Check audioMaxDuration has a value and convert it to an integer
			int audioMaxDurationInt = 0;
			if (!String.IsNullOrWhiteSpace(audioMaxDuration))
			{
				audioMaxDurationInt = Int32.Parse(audioMaxDuration);
			}
			// Check audioYear has a value and convert it to an integer
			int audioYearInt = 0;
			if (!String.IsNullOrWhiteSpace(audioYear))
			{
				audioYearInt = Int32.Parse(audioYear);
			}

			// Filter the Audio DB based on the filter values supplied by the user
			var audio = _db.Audio
						.Where(r => audioSearch == null || r.ArtistName.StartsWith(audioSearch))
						.Where(r => audioTypeInt == 0 || r.AudioType.AudioTypeId.Equals(audioTypeInt))
						.Where(r => audioYearInt == 0 || r.AudioReleaseYear.Equals(audioYearInt))
						.Where(r => audioMinDurationInt == 0 || r.AudioDuration >= audioMinDurationInt)
						.Where(r => audioMaxDurationInt == 0 || r.AudioDuration <= audioMaxDurationInt);

			return Json(audio, JsonRequestBehavior.AllowGet);
		}

		/// <summary>
		/// Update the PlayNextItem indicator in the audio database.
		/// </summary>
		/// <param name="scheduleItemId">The ScheduleItemId that the PlayNextIndicator needs to be updated</param>
		/// <returns></returns>
		[HttpPost]
		public ActionResult UpdatePlayNextItemIndicator(string scheduleItemId)
		{
			// If the scheduleItemId exists convert it to an integer
			int scheduleItemIdInt = 0;
			if (!String.IsNullOrWhiteSpace(scheduleItemId))
			{
				scheduleItemIdInt = Int32.Parse(scheduleItemId);
			}
			// Find the schedule item with the inputted scheduleItemId
			var scheduleItems = _db.ScheduleItems.Where(r => r.ScheduleItemsId.Equals(scheduleItemIdInt));

			foreach(ScheduleItems scheduleItem in scheduleItems)
			{
				// If the PlayNextItem is current set to 0 set it to 1 and vice versa
				if(scheduleItem.PlayNextItem == 0)
				{
					scheduleItem.PlayNextItem = 1;
				}
				else
				{
					scheduleItem.PlayNextItem = 0;
				}
			}

			// Save the database changes
			_db.SaveChanges();

			return Json("", JsonRequestBehavior.AllowGet);
		}
		
		/// <summary>
		/// Get the track info from the Audio DB based on an AudioId
		/// </summary>
		/// <param name="audioId">The AudioId of the audio item from the database</param>
		/// <returns>A JSON object with the Audio data</returns>
		[HttpPost]
		public ActionResult GetTrackInfo(string audioId)
		{
			// Check whether the audioId has a value and convert it to an integer
			int audioIdInt = 0;
			if(audioId != null)
			{
				audioIdInt = Int32.Parse(audioId.Trim());
			}

			// Search the Audio DB for the audio item based on the audioId
			var audio = _db.Audio.Where(r => r.AudioId.Equals(audioIdInt));

			return Json(audio, JsonRequestBehavior.AllowGet);
		}

		protected override void Dispose(bool disposing)
		{
			if (_db != null)
			{
				_db.Dispose();
			}
		}
	}
}