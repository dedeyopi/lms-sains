{lesson.content_type === 'simulation_embed' && (
  <iframe
    src={lesson.content}
    className="w-full h-96 border rounded"
    allowFullScreen
  />
)}