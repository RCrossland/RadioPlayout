using RadioPlayout.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RadioPlayout.Controllers
{
    public class ScheduleController : Controller
    {
		private RadioPlayoutDb _db = new RadioPlayoutDb();

		// GET: ScheduleClock
		public ActionResult Index()
        {
            return View();
        }

		[HttpPost]
		public ActionResult GetAudioType()
		{
			// Select all audio types from the database
			var audioType = _db.AudioType;
			// Return the audio types to the db
			return Json(audioType);
		}
    }
}